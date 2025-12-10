import argparse
import os
import pickle
import time
from typing import List, Tuple, Union

import cv2


def build_capture_source(args: argparse.Namespace) -> Union[str, int]:
    """Define a fonte de captura: URL RTSP tem prioridade, senao indice."""
    if args.camera_url:
        return args.camera_url
    return args.camera_index


def proximo_indice(path_saida: str) -> int:
    """Descobre o proximo numero de arquivo foto_XXX.jpg no diretorio."""
    arquivos = [
        f for f in os.listdir(path_saida)
        if f.startswith("foto_") and f.endswith(".jpg")
    ]
    if not arquivos:
        return 1
    numeros = [int(f[5:8]) for f in arquivos if f[5:8].isdigit()]
    return max(numeros) + 1 if numeros else 1


def carregar_coordenadas(path: str) -> List[Tuple[int, int, int, int]]:
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Nao foi possivel encontrar o arquivo de coordenadas: {path}")
    with open(path, "rb") as fp:
        coords = pickle.load(fp)
    return coords


def main():
    parser = argparse.ArgumentParser(description="Captura imagens de camera/RTSP em intervalos fixos.")
    parser.add_argument("--camera_url", "--camera-url", type=str, default="", help="URL RTSP completa.")
    parser.add_argument("--camera_index", "--camera-index", type=int, default=0, help="Indice da camera local.")
    parser.add_argument("--output_dir", "--output-dir", type=str, default="imagens", help="Diretorio de saida para fotos.")
    parser.add_argument("--intervalo", type=int, default=30, help="Intervalo entre fotos (s).")
    parser.add_argument("--duracao", type=int, default=600, help="Duracao total da captura (s).")
    parser.add_argument("--coords", type=str, default="", help="Arquivo pickle com coordenadas (recortes.pkl) para salvar recortes.")
    parser.add_argument("--crop_dir", "--crop-dir", type=str, default="", help="Pasta base para salvar recortes (padrao: output_dir).")
    args = parser.parse_args()

    fonte = build_capture_source(args)
    cap = cv2.VideoCapture(fonte)

    if not cap.isOpened():
        print("Nao foi possivel conectar a camera.")
        return

    os.makedirs(args.output_dir, exist_ok=True)
    contador = proximo_indice(args.output_dir)

    intervalo = max(1, args.intervalo)
    total_fotos = max(1, args.duracao // intervalo)

    coords = []
    crop_base = ""
    if args.coords:
        try:
            coords = carregar_coordenadas(args.coords)
            crop_base = args.crop_dir if args.crop_dir else args.output_dir
            os.makedirs(crop_base, exist_ok=True)
            print(f"Coordenadas carregadas ({len(coords)} ROI) de {args.coords}. Recortes em: {crop_base}")
        except Exception as exc:  # pylint: disable=broad-except
            print(f"Falha ao carregar coordenadas ({args.coords}): {exc}")
            return

    try:
        fotos_tiradas = 0
        tempo_ultima_foto = time.time()
        tempo_inicio = tempo_ultima_foto
        while fotos_tiradas < total_fotos:
            ret, frame = cap.read()
            if not ret:
                print("Falha ao capturar frame.")
                break

            tempo_atual = time.time()
            tempo_decorrido = int(tempo_atual - tempo_inicio)
            tempo_total = intervalo * total_fotos
            tempo_restante = max(0, tempo_total - tempo_decorrido)
            minutos_decorridos = tempo_decorrido // 60
            segundos_decorridos = tempo_decorrido % 60
            minutos_restantes = tempo_restante // 60
            segundos_restantes = tempo_restante % 60
            print(
                f"Tempo decorrido: {minutos_decorridos:02d}:{segundos_decorridos:02d} | "
                f"Tempo restante: {minutos_restantes:02d}:{segundos_restantes:02d}",
                end="\r",
            )

            if tempo_atual - tempo_ultima_foto >= intervalo:
                nome_arquivo = os.path.join(args.output_dir, f"foto_{contador:03d}.jpg")
                cv2.imwrite(nome_arquivo, frame)
                print(f"\nFoto salva: {nome_arquivo}")

                if coords:
                    for idx, (x, y, w, h) in enumerate(coords, start=1):
                        if w <= 0 or h <= 0:
                            continue
                        recorte = frame[int(y): int(y + h), int(x): int(x + w)]
                        pasta_roi = os.path.join(crop_base, f"coordenada{idx}")
                        os.makedirs(pasta_roi, exist_ok=True)
                        nome_crop = os.path.join(pasta_roi, f"foto_{contador:03d}.jpg")
                        cv2.imwrite(nome_crop, recorte)
                        print(f"[crop] coordenada{idx} -> {nome_crop}")

                contador += 1
                fotos_tiradas += 1
                tempo_ultima_foto = time.time()

        print(f"\nTempo de captura finalizado ({total_fotos} fotos).")
    except KeyboardInterrupt:
        print("\nInterrompido pelo usuario.")
    finally:
        cap.release()


if __name__ == "__main__":
    main()
