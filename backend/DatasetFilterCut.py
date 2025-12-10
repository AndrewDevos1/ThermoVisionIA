import argparse
import os
import pickle
import time
from typing import List, Tuple

import cv2
from tqdm import tqdm


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def carrega_coordenadas(path: str) -> List[Tuple[int, int, int, int]]:
    if not os.path.isfile(path):
        raise SystemExit(f"Arquivo de coordenadas nao encontrado: {path}")
    with open(path, "rb") as fp:
        coords = pickle.load(fp)
    return coords


def lista_imagens(pasta: str) -> List[str]:
    if not os.path.isdir(pasta):
        return []
    return [
        os.path.join(pasta, f)
        for f in os.listdir(pasta)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]


def salva_recorte(img, pasta, nome_base, pbar=None):
    ensure_dir(pasta)
    existentes = [
        f for f in os.listdir(pasta) if f.startswith(nome_base) and f.lower().endswith(".jpg")
    ]
    if existentes:
        numeros = [
            int(f.split("_")[-1].split(".")[0])
            for f in existentes
            if f.split("_")[-1].split(".")[0].isdigit()
        ]
        proximo = max(numeros) + 1 if numeros else 1
    else:
        proximo = 1
    nome = os.path.join(pasta, f"{nome_base}_{proximo:03d}.jpg")
    cv2.imwrite(nome, img)
    if pbar:
        pbar.write(f"[recorte] {nome}")


def processa_pasta(
    pasta_filtro: str,
    coords: List[Tuple[int, int, int, int]],
    output_dir: str,
    pbar_global=None,
):
    arquivos = lista_imagens(pasta_filtro)
    if not arquivos:
        print(f"[aviso] Pasta '{pasta_filtro}' vazia ou inexistente; pulando.")
        return
    start_time = time.time()
    with tqdm(total=len(arquivos), desc=f"Recortando {pasta_filtro}", unit="img", ncols=80) as pbar:
        for nome_arquivo in arquivos:
            img = cv2.imread(nome_arquivo)
            if img is None:
                pbar.write(f"[erro] Nao foi possivel abrir {nome_arquivo}")
                pbar.update(1)
                continue
            for idx, (x, y, w, h) in enumerate(coords, start=1):
                if w <= 0 or h <= 0:
                    continue
                recorte = img[int(y): int(y + h), int(x): int(x + w)]
                pasta_saida = os.path.join(output_dir, f"coordenada{idx}", pasta_filtro)
                nome_base = f"coordenada{idx}_{pasta_filtro}"
                salva_recorte(recorte, pasta_saida, nome_base, pbar)
            pbar.update(1)
    elapsed = time.time() - start_time
    minutos, segundos = divmod(int(elapsed), 60)
    print(f"[ok] {pasta_filtro}: {minutos}m{segundos}s")
    if pbar_global:
        pbar_global.update(1)


def main():
    parser = argparse.ArgumentParser(
        description="Aplica recortes salvos (recortes.pkl) nas pastas de filtros."
    )
    parser.add_argument(
        "--coords",
        default="recortes.pkl",
        help="Arquivo pickle com coordenadas (padrao: recortes.pkl).",
    )
    parser.add_argument(
        "--input-dirs",
        nargs="*",
        default=["imgAdpGray2", "imgCanny", "imgCannyInvertido"],
        help="Pastas de entrada (filtros) com imagens a recortar.",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Pasta base onde serao salvos os recortes (padrao: .).",
    )

    args = parser.parse_args()

    coords = carrega_coordenadas(args.coords)
    if not coords:
        raise SystemExit("Nenhuma coordenada encontrada em recortes.")

    total_pastas = len(args.input_dirs)
    with tqdm(total=total_pastas, desc="Pastas de filtros", unit="pasta", ncols=80) as pbar_global:
        for pasta in args.input_dirs:
            processa_pasta(pasta, coords, args.output_dir, pbar_global)


if __name__ == "__main__":
    main()
