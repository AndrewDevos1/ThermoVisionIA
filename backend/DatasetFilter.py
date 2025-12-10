import argparse
import os
from typing import Iterable, List

import cv2
import numpy as np


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def iter_imagens(inputs: List[str], input_dir: str) -> Iterable[str]:
    arquivos: List[str] = []
    arquivos.extend(inputs)
    if input_dir:
        for nome in os.listdir(input_dir):
            if nome.lower().endswith((".jpg", ".jpeg", ".png")):
                arquivos.append(os.path.join(input_dir, nome))
    # Remove duplicados mantendo ordem
    vistos = set()
    for arq in arquivos:
        if arq not in vistos:
            vistos.add(arq)
            yield arq


def salva_em_pasta(img, pasta_base: str, subpasta: str, nome_base: str):
    pasta = os.path.join(pasta_base, subpasta)
    ensure_dir(pasta)
    existentes = [
        f for f in os.listdir(pasta) if f.startswith(nome_base) and f.lower().endswith(".jpg")
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
    destino = os.path.join(pasta, f"{nome_base}_{proximo:03d}.jpg")
    cv2.imwrite(destino, img)
    print(f"[salvo] {destino}")


def processa_imagem(
    caminho: str,
    brilho: int,
    adp_block: int,
    adp_c: int,
    canny_low: int,
    canny_high: int,
    out_base: str,
):
    img = cv2.imread(caminho)
    if img is None:
        print(f"[erro] Nao foi possivel abrir {caminho}")
        return

    img_brilho = cv2.convertScaleAbs(img, alpha=1, beta=brilho)
    img_gray = cv2.cvtColor(img_brilho, cv2.COLOR_BGR2GRAY)
    img_adp = cv2.adaptiveThreshold(
        img_gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, adp_block, adp_c
    )
    img_canny = cv2.Canny(img_gray, canny_low, canny_high)
    img_canny_inv = cv2.bitwise_not(img_canny)

    salva_em_pasta(img_brilho, out_base, "imgBrilho", "imgBrilho")
    salva_em_pasta(img_adp, out_base, "imgAdpGray2", "imgAdpGray2")
    salva_em_pasta(img_canny, out_base, "imgCanny", "imgCanny")
    salva_em_pasta(img_canny_inv, out_base, "imgCannyInvertido", "imgCannyInvertido")


def main():
    parser = argparse.ArgumentParser(
        description="Aplica filtros (brilho, adaptive threshold, canny) em imagens."
    )
    parser.add_argument(
        "--input",
        nargs="*",
        default=[],
        help="Arquivos de entrada (pode listar varios).",
    )
    parser.add_argument(
        "--input-dir",
        default="",
        help="Pasta com imagens (.jpg/.png) para processar.",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Pasta base para salvar resultados (serao criadas subpastas por filtro).",
    )
    parser.add_argument("--brilho", type=int, default=-40, help="Ajuste de brilho (padrao: -40).")
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

    if not args.input and not args.input_dir:
        raise SystemExit("Informe --input <arquivos> ou --input-dir <pasta>.")

    if args.adaptive_block_size % 2 == 0 or args.adaptive_block_size <= 1:
        raise SystemExit("--adaptive-block-size deve ser impar e maior que 1.")

    arquivos = list(iter_imagens(args.input, args.input_dir))
    if not arquivos:
        raise SystemExit("Nenhuma imagem encontrada para processar.")

    for caminho in arquivos:
        processa_imagem(
            caminho,
            args.brilho,
            args.adaptive_block_size,
            args.adaptive_c,
            args.canny_low,
            args.canny_high,
            args.output_dir,
        )


if __name__ == "__main__":
    main()
