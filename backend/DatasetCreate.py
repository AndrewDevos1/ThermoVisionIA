import argparse
import cv2
import time
import os
from typing import Optional, Union


def build_capture_source(args: argparse.Namespace) -> Union[str, int]:
    """Define a fonte de captura: URL RTSP tem prioridade, senão índice."""
    if args.camera_url:
        return args.camera_url
    return args.camera_index


def proximo_indice(path_saida: str) -> int:
    """Descobre o próximo número de arquivo foto_XXX.jpg no diretório."""
    arquivos = [
        f for f in os.listdir(path_saida)
        if f.startswith("foto_") and f.endswith(".jpg")
    ]
    if not arquivos:
        return 1
    numeros = [int(f[5:8]) for f in arquivos if f[5:8].isdigit()]
    return max(numeros) + 1 if numeros else 1


def main():
    parser = argparse.ArgumentParser(description="Captura imagens de câmera/RTSP em intervalos fixos.")
    parser.add_argument("--camera_url", "--camera-url", type=str, default="", help="URL RTSP completa.")
    parser.add_argument("--camera_index", "--camera-index", type=int, default=0, help="Índice da câmera local.")
    parser.add_argument("--output_dir", "--output-dir", type=str, default="imagens", help="Diretório de saída para fotos.")
    parser.add_argument("--intervalo", type=int, default=30, help="Intervalo entre fotos (s).")
    parser.add_argument("--duracao", type=int, default=600, help="Duração total da captura (s).")
    args = parser.parse_args()

    fonte = build_capture_source(args)
    cap = cv2.VideoCapture(fonte)

    if not cap.isOpened():
        print("Não foi possível conectar à câmera.")
        return

    os.makedirs(args.output_dir, exist_ok=True)
    contador = proximo_indice(args.output_dir)

    intervalo = max(1, args.intervalo)
    total_fotos = max(1, args.duracao // intervalo)

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
                contador += 1
                fotos_tiradas += 1
                tempo_ultima_foto = time.time()

        print(f"\nTempo de captura finalizado ({total_fotos} fotos).")
    except KeyboardInterrupt:
        print("\nInterrompido pelo usuário.")
    finally:
        cap.release()


if __name__ == "__main__":
    main()
