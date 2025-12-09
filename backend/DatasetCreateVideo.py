import cv2  # Importa a biblioteca OpenCV para manipulação de vídeo e imagens
import time  # Importa a biblioteca time para controle de tempo
import os    # Importa a biblioteca os para manipulação de arquivos e diretórios

# Substitua pelos seus dados de acesso à câmera
usuario = 'admin'
senha = 'ULLMPG'
ip = '192.168.88.5'
porta = 554

# Monta a URL de acesso RTSP da câmera
url = f'rtsp://{usuario}:{senha}@{ip}:{porta}/cam/realmonitor?channel=1&subtype=0'

# Abre a conexão com a câmera
cap = cv2.VideoCapture(url)

# Verifica se a conexão foi bem-sucedida
if not cap.isOpened():
    print("Não foi possível conectar à câmera IC3.")
    exit()

# Cria as pastas 'imagens' e 'Videos' se não existirem
os.makedirs("imagens", exist_ok=True)
os.makedirs("Videos", exist_ok=True)

# Descobre o próximo número de foto disponível
arquivos = [f for f in os.listdir("imagens") if f.startswith("foto_") and f.endswith(".jpg")]
if arquivos:
    numeros = [int(f[5:8]) for f in arquivos if f[5:8].isdigit()]
    contador = max(numeros) + 1 if numeros else 1
else:
    contador = 1

# Descobre o próximo número de vídeo disponível na pasta Videos
arquivos_videos = [f for f in os.listdir("Videos") if f.startswith("video_") and f.endswith(".mp4")]
if arquivos_videos:
    numeros_videos = [int(f[6:9]) for f in arquivos_videos if f[6:9].isdigit()]
    contador_video = max(numeros_videos) + 1 if numeros_videos else 1
else:
    contador_video = 1

intervalo = 30  # Intervalo em segundos entre as fotos
total_fotos = 30 * 60 // intervalo  # 10 minutos, uma foto a cada 30s = 20 fotos

fps = 20.0  # Frames por segundo do vídeo
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))  # Largura do frame
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))  # Altura do frame
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec para MP4

try:
    fotos_tiradas = 0  # Contador de fotos tiradas
    tempo_ultima_foto = time.time()  # Marca o tempo da última foto
    tempo_inicio = tempo_ultima_foto  # Marca o início da captura
    tempo_inicio_video = tempo_ultima_foto  # Marca o início do vídeo atual

    # Cria o primeiro arquivo de vídeo MP4 na pasta Videos
    video_nome = f"Videos/video_{contador_video:03d}.mp4"
    video_writer = cv2.VideoWriter(video_nome, fourcc, fps, (frame_width, frame_height))
    print(f"Gravando vídeo em: {video_nome}")

    while fotos_tiradas < total_fotos:
        ret, frame = cap.read()  # Captura um frame da câmera
        if not ret:
            print("Falha ao capturar frame.")
            break
        cv2.imshow('IC3 Intelbras', frame)  # Mostra o frame na tela

        # Grava o frame no vídeo atual
        video_writer.write(frame)

        tempo_atual = time.time()  # Tempo atual
        tempo_decorrido = int(tempo_atual - tempo_inicio)  # Tempo decorrido desde o início
        tempo_total = intervalo * total_fotos  # Tempo total de captura
        tempo_restante = max(0, tempo_total - tempo_decorrido)  # Tempo restante
        minutos_decorridos = tempo_decorrido // 60
        segundos_decorridos = tempo_decorrido % 60
        minutos_restantes = tempo_restante // 60
        segundos_restantes = tempo_restante % 60
        print(f"Tempo decorrido: {minutos_decorridos:02d}:{segundos_decorridos:02d} | Tempo restante: {minutos_restantes:02d}:{segundos_restantes:02d}", end='\r')

        # Salva uma foto a cada intervalo definido
        if tempo_atual - tempo_ultima_foto >= intervalo:
            nome_arquivo = f"imagens/foto_{contador:03d}.jpg"
            cv2.imwrite(nome_arquivo, frame)
            print(f"\nFoto salva: {nome_arquivo}")
            contador += 1
            fotos_tiradas += 1
            tempo_ultima_foto = time.time()

        # Troca de vídeo a cada 30 segundos
        if tempo_atual - tempo_inicio_video >= 30:
            video_writer.release()  # Finaliza o vídeo atual
            contador_video += 1
            video_nome = f"Videos/video_{contador_video:03d}.mp4"
            video_writer = cv2.VideoWriter(video_nome, fourcc, fps, (frame_width, frame_height))
            print(f"\nNovo vídeo iniciado: {video_nome}")
            tempo_inicio_video = time.time()

        # Permite sair do programa pressionando a barra de espaço
        if cv2.waitKey(1) & 0xFF == ord(' '):
            raise KeyboardInterrupt

    print("\nTempo de captura finalizado (10 minutos).")
except KeyboardInterrupt:
    print("\nInterrompido pelo usuário.")

cap.release()  # Libera a câmera
video_writer.release()  # Finaliza o arquivo de vídeo
cv2.destroyAllWindows()  # Fecha todas as janelas do OpenCV