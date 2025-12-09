import cv2
import time
import os

# Substitua pelos seus dados  192.168.88.110
usuario = 'admin'
senha = 'Kaiser@210891'
ip = '192.168.88.110'
porta = 554

url = f'rtsp://{usuario}:{senha}@{ip}:{porta}/cam/realmonitor?channel=1&subtype=0'

cap = cv2.VideoCapture(url)

if not cap.isOpened():
    print("Não foi possível conectar à câmera IC3.")
    exit()

# Cria a pasta 'imagens' na raiz, se não existir
os.makedirs("imagens", exist_ok=True)

# Descobre o próximo número de foto disponível
arquivos = [f for f in os.listdir("imagens") if f.startswith("foto_") and f.endswith(".jpg")]
if arquivos:
    numeros = [int(f[5:8]) for f in arquivos if f[5:8].isdigit()]
    contador = max(numeros) + 1 if numeros else 1
else:
    contador = 1

intervalo = 30  # segundos
total_fotos = 30 * 60 // intervalo  # 10 minutos, uma foto a cada 30s = 20 fotos

try:
    fotos_tiradas = 0
    tempo_ultima_foto = time.time()
    tempo_inicio = tempo_ultima_foto  # Marca o início
    while fotos_tiradas < total_fotos:
        ret, frame = cap.read()
        if not ret:
            print("Falha ao capturar frame.")
            break

        # Mostra tempo decorrido e restante
        tempo_atual = time.time()
        tempo_decorrido = int(tempo_atual - tempo_inicio)
        tempo_total = intervalo * total_fotos
        tempo_restante = max(0, tempo_total - tempo_decorrido)
        minutos_decorridos = tempo_decorrido // 60
        segundos_decorridos = tempo_decorrido % 60
        minutos_restantes = tempo_restante // 60
        segundos_restantes = tempo_restante % 60
        print(f"Tempo decorrido: {minutos_decorridos:02d}:{segundos_decorridos:02d} | Tempo restante: {minutos_restantes:02d}:{segundos_restantes:02d}", end='\r')

        # Se passou o intervalo, salva a foto
        if tempo_atual - tempo_ultima_foto >= intervalo:
            nome_arquivo = f"imagens/foto_{contador:03d}.jpg"
            cv2.imwrite(nome_arquivo, frame)
            print(f"\nFoto salva: {nome_arquivo}")
            contador += 1
            fotos_tiradas += 1
            tempo_ultima_foto = time.time()
    print("\nTempo de captura finalizado (10 minutos).")
except KeyboardInterrupt:
    print("\nInterrompido pelo usuário.")

# Libera os recursos
cap.release()
