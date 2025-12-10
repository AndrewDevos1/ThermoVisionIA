import argparse
import os
import pickle
from typing import List, Tuple

import cv2


def parse_roi(value: str) -> Tuple[int, int, int, int]:
    """Converte string 'x,y,w,h' em tupla de inteiros."""
    try:
        parts = [int(p.strip()) for p in value.split(",")]
        if len(parts) != 4:
            raise ValueError
        return tuple(parts)  # type: ignore[return-value]
    except Exception as exc:  # pylint: disable=broad-except
        raise argparse.ArgumentTypeError("ROI deve ser no formato x,y,w,h") from exc


def next_filename(base_dir: str, prefix: str) -> str:
    """Gera nome sequencial para salvar recortes."""
    os.makedirs(base_dir, exist_ok=True)
    existentes = [
        f
        for f in os.listdir(base_dir)
        if f.startswith(prefix) and f.lower().endswith(".jpg")
    ]
    if existentes:
        numeros = [
            int(f.split("_")[1].split(".")[0])
            for f in existentes
            if f.split("_")[1].split(".")[0].isdigit()
        ]
        proximo = max(numeros) + 1 if numeros else 1
    else:
        proximo = 1
    return os.path.join(base_dir, f"{prefix}_{proximo:03d}.jpg")


def selecionar_rois_interativo(imagem, largura_destino: int, qtd: int) -> List[Tuple[int, int, int, int]]:
    """Permite selecionar rois com o mouse e converte para escala original."""
    altura_original, largura_original = imagem.shape[:2]
    escala = largura_destino / largura_original
    nova_altura = int(altura_original * escala)
    img_redim = cv2.resize(imagem, (largura_destino, nova_altura))
    rois: List[Tuple[int, int, int, int]] = []
    for _ in range(qtd):
        roi = cv2.selectROI("Imagem", img_redim, fromCenter=False, showCrosshair=True)
        cv2.destroyWindow("Imagem")
        x, y, w, h = roi
        rois.append(
            (
                int(x / escala),
                int(y / escala),
                int(w / escala),
                int(h / escala),
            )
        )
    return rois


def salvar_coordenadas(path: str, dados: List[Tuple[int, int, int, int]]) -> None:
    with open(path, "wb") as fp:
        pickle.dump(dados, fp)


def salvar_recortes(imagem, rois: List[Tuple[int, int, int, int]], destino_base: str) -> None:
    for idx, (x, y, w, h) in enumerate(rois, start=1):
        if w <= 0 or h <= 0:
            continue
        recorte = imagem[int(y): int(y + h), int(x): int(x + w)]
        pasta = os.path.join(destino_base, f"coordenada{idx}")
        nome = next_filename(pasta, f"coordenada{idx}")
        cv2.imwrite(nome, recorte)
        print(f"[recorte] salvo: {nome}")


def desenhar_rois(imagem, rois: List[Tuple[int, int, int, int]], largura_destino: int):
    img_copy = imagem.copy()
    for x, y, w, h in rois:
        if w > 0 and h > 0:
            cv2.rectangle(img_copy, (int(x), int(y)), (int(x + w), int(y + h)), (0, 255, 0), 2)
    altura_original, largura_original = img_copy.shape[:2]
    escala = largura_destino / largura_original
    nova_altura = int(altura_original * escala)
    preview = cv2.resize(img_copy, (largura_destino, nova_altura))
    cv2.imshow("Recortes", preview)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(
        description="Define e salva coordenadas de ROI; opcionalmente gera recortes.",
    )
    parser.add_argument(
        "-i",
        "--input-image",
        required=True,
        help="Imagem de referencia para definir/validar ROIs.",
    )
    parser.add_argument(
        "-o",
        "--output-coordinates",
        default="recortes.pkl",
        help="Arquivo pickle de saida com as coordenadas (padrao: recortes.pkl).",
    )
    parser.add_argument(
        "--roi",
        action="append",
        type=parse_roi,
        help="ROI no formato x,y,w,h (pode repetir). Se ausente e --interactive for usado, sera solicitado via mouse.",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Permite selecionar ROIs com o mouse (usa cv2.selectROI).",
    )
    parser.add_argument(
        "--interactive-count",
        type=int,
        default=1,
        help="Quantidade de ROIs ao usar modo interativo (padrao: 1).",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Mostra imagem com retangulos desenhados ao final.",
    )
    parser.add_argument(
        "--save-crops",
        action="store_true",
        help="Salva recortes em pastas coordenadaN (padrao: nao salva).",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Pasta base para salvar recortes (padrao: .).",
    )
    parser.add_argument(
        "--display-width",
        type=int,
        default=1024,
        help="Largura usada para redimensionar preview/interativo (padrao: 1024).",
    )

    args = parser.parse_args()

    imagem = cv2.imread(args.input_image)
    if imagem is None:
        raise SystemExit(f"Nao foi possivel abrir a imagem: {args.input_image}")

    rois: List[Tuple[int, int, int, int]] = []

    if args.roi:
        rois.extend(args.roi)

    if args.interactive:
        rois_interativos = selecionar_rois_interativo(imagem, args.display_width, args.interactive_count)
        rois.extend(rois_interativos)

    if not rois:
        raise SystemExit("Nenhuma ROI fornecida. Use --roi x,y,w,h ou --interactive.")

    salvar_coordenadas(args.output_coordinates, rois)
    print(f"[coords] salvas em {args.output_coordinates}")

    if args.save_crops:
        salvar_recortes(imagem, rois, args.output_dir)

    if args.preview:
        desenhar_rois(imagem, rois, args.display_width)


if __name__ == "__main__":
    main()
