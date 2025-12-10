import argparse
import os
import time
from typing import List

import cv2
from tqdm import tqdm


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def lista_imagens(pasta: str) -> List[str]:
    if not os.path.isdir(pasta):
        raise SystemExit(f"Pasta de imagens nao encontrada: {pasta}")
    return [
        os.path.join(pasta, f)
        for f in os.listdir(pasta)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]


def salva_em_pasta(img, base: str, subpasta: str, nome_base: str, pbar=None):
    destino = os.path.join(base, subpasta)
    ensure_dir(destino)
    existentes = [
        f for f in os.listdir(destino) if f.startswith(nome_base) and f.lower().endswith(".jpg")
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
    caminho = os.path.join(destino, f"{nome_base}_{proximo:03d}.jpg")
    cv2.imwrite(caminho, img)
    if pbar:
        pbar.write(f"[salvo] {caminho}")


def processa_imagem(
    caminho: str,
    adp_block: int,
    adp_c: int,
    canny_low: int,
    canny_high: int,
    out_base: str,
    pbar=None,
):
    img = cv2.imread(caminho)
    if img is None:
        if pbar:
            pbar.write(f"[erro] Nao foi possivel abrir {caminho}")
        return

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img_adp = cv2.adaptiveThreshold(
        img_gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, adp_block, adp_c
    )
    img_canny = cv2.Canny(img_gray, canny_low, canny_high)
    img_canny_inv = cv2.bitwise_not(img_canny)

    salva_em_pasta(img_adp, out_base, "imgAdpGray2", "imgAdpGray2", pbar)
    salva_em_pasta(img_canny, out_base, "imgCanny", "imgCanny", pbar)
    salva_em_pasta(img_canny_inv, out_base, "imgCannyInvertido", "imgCannyInvertido", pbar)


def main():
    parser = argparse.ArgumentParser(
        description="Aplica filtros em lote em todas as imagens de uma pasta."
    )
    parser.add_argument(
        "--input-dir",
        default="imagens",
        help="Pasta de entrada com imagens (padrao: imagens).",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Pasta base onde serao criadas as pastas dos filtros (padrao: .).",
    )
    parser.add_argument(
        "--adaptive-block-size",
        type=int,
        default=11,
        help="Tamanho do bloco do adaptive threshold (impar > 1). Padrao: 11.",
    )
    parser.add_argument(
        "--adaptive-c",
        type=int,
        default=2,
        help="Constante subtraida no adaptive threshold (padrao: 2).",
    )
    parser.add_argument(
        "--canny-low",
        type=int,
        default=100,
        help="Limiar inferior do Canny (padrao: 100).",
    )
    parser.add_argument(
        "--canny-high",
        type=int,
        default=200,
        help="Limiar superior do Canny (padrao: 200).",
    )

    args = parser.parse_args()

    if args.adaptive_block_size % 2 == 0 or args.adaptive_block_size <= 1:
        raise SystemExit("--adaptive-block-size deve ser impar e maior que 1.")

    arquivos = lista_imagens(args.input_dir)
    if not arquivos:
        raise SystemExit("Nenhuma imagem encontrada para processar.")

    start_time = time.time()
    with tqdm(total=len(arquivos), desc="Processando imagens", unit="img", ncols=80) as pbar:
        for caminho in arquivos:
            processa_imagem(
                caminho,
                args.adaptive_block_size,
                args.adaptive_c,
                args.canny_low,
                args.canny_high,
                args.output_dir,
                pbar,
            )
            pbar.update(1)

    elapsed = time.time() - start_time
    minutos, segundos = divmod(int(elapsed), 60)
    print(f"\nProcessamento concluido em {minutos}m{segundos}s.")


if __name__ == "__main__":
    main()
