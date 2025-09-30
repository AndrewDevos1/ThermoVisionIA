import cv2
import numpy as np
import os
from tqdm import tqdm
import time
import msvcrt  # Para detectar tecla pressionada no Windows

# Função para salvar a imagem em uma pasta, sem sobrescrever arquivos existentes
def salva_em_pasta(img, pasta, nome_base, pbar=None):
    os.makedirs(pasta, exist_ok=True)  # Cria a pasta se não existir
    arquivos = [f for f in os.listdir(pasta) if f.startswith(nome_base) and f.endswith('.jpg')]
    if arquivos:
        numeros = [int(f.split('_')[1].split('.')[0]) for f in arquivos if f.split('_')[1].split('.')[0].isdigit()]
        proximo_num = max(numeros) + 1 if numeros else 1
    else:
        proximo_num = 1
    nome_arquivo = f"{pasta}/{nome_base}_{proximo_num:03d}.jpg"
    cv2.imwrite(nome_arquivo, img)
    # Se quiser mostrar mensagem sem quebrar a barra de progresso:
    if pbar:
        pbar.write(f"Imagem salva: {nome_arquivo}")

# Função que aplica os filtros em uma imagem e salva os resultados
def processa_imagem(nome_arquivo, pbar=None):
    img = cv2.imread(nome_arquivo)
    if img is None:
        if pbar:
            pbar.write(f"Não foi possível abrir {nome_arquivo}")
        return

    # Converte para escala de cinza
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Aplica limiarização adaptativa
    imgAdpGray2 = cv2.adaptiveThreshold(
        imgGray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
    # Aplica filtro de bordas Canny
    imgCanny = cv2.Canny(imgGray, 100, 200)
    # Inverte o resultado do Canny
    imgCannyInvertido = cv2.bitwise_not(imgCanny)

    # Salva cada imagem filtrada em sua respectiva pasta
    salva_em_pasta(imgAdpGray2, "imgAdpGray2", "imgAdpGray2", pbar)
    salva_em_pasta(imgCanny, "imgCanny", "imgCanny", pbar)
    salva_em_pasta(imgCannyInvertido, "imgCannyInvertido", "imgCannyInvertido", pbar)

# ======= TROQUE AQUI PARA ALTERAR A PASTA DE IMAGENS =========
pasta_imagens = "imagens"  # <-- Troque o nome da pasta aqui, se quiser aplicar os filtros em outra pasta
# =============================================================

# Lê todos os arquivos .jpg da pasta escolhida
arquivos = [os.path.join(pasta_imagens, f) for f in os.listdir(pasta_imagens) if f.lower().endswith('.jpg')]

print("Pressione ESPAÇO a qualquer momento para interromper o processamento.\n")

start_time = time.time()
try:
    with tqdm(total=len(arquivos), desc="Processando imagens", unit="img", ncols=80) as pbar:
        for nome_arquivo in arquivos:
            processa_imagem(nome_arquivo, pbar)
            pbar.update(1)
            # Verifica se a barra de espaço foi pressionada
            if msvcrt.kbhit():
                if msvcrt.getch() == b' ':
                    pbar.write("\nProcessamento interrompido pelo usuário.")
                    break
except KeyboardInterrupt:
    print("\nProcessamento interrompido pelo usuário.")

elapsed = time.time() - start_time
minutos, segundos = divmod(int(elapsed), 60)
print(f"\nProcessamento concluído em {minutos}m{segundos}s.")

cv2.destroyAllWindows()