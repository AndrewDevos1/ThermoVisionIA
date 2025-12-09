import cv2
import numpy as np
import os

# Função para salvar a imagem em uma pasta, sem sobrescrever arquivos existentes
def salva_em_pasta(img, pasta, nome_base):
    os.makedirs(pasta, exist_ok=True)  # Cria a pasta se não existir
    # Lista arquivos já existentes para manter a sequência
    arquivos = [f for f in os.listdir(pasta) if f.startswith(nome_base) and f.endswith('.jpg')]
    if arquivos:
        # Extrai o número do arquivo para continuar a sequência
        numeros = [int(f.split('_')[1].split('.')[0]) for f in arquivos if f.split('_')[1].split('.')[0].isdigit()]
        proximo_num = max(numeros) + 1 if numeros else 1
    else:
        proximo_num = 1
    nome_arquivo = f"{pasta}/{nome_base}_{proximo_num:03d}.jpg"
    cv2.imwrite(nome_arquivo, img)  # Salva a imagem
    print(f"Imagem salva: {nome_arquivo}")

# Função para processar cada imagem
def processa_imagem(nome_arquivo):
    img = cv2.imread(nome_arquivo)  # Lê a imagem
    if img is None:
        print(f"Não foi possível abrir {nome_arquivo}")
        return

    # === 1. Controle de brilho ===
    brilho = -40  # Valor negativo reduz brilho, positivo aumenta
    imgBrilho = cv2.convertScaleAbs(img, alpha=1, beta=brilho)

    # Converte para escala de cinza
    imgGray = cv2.cvtColor(imgBrilho, cv2.COLOR_BGR2GRAY)

    # === 2. Filtro Adaptive Threshold (Mean) ===
    imgAdpGray2 = cv2.adaptiveThreshold(
        imgGray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)

    # === 3. Filtro Canny ===
    imgCanny = cv2.Canny(imgGray, 100, 200)

    # === 4. Filtro Canny Invertido ===
    imgCannyInvertido = cv2.bitwise_not(imgCanny)

    # Exibe as imagens para visualização, com o nome do arquivo e filtro
    cv2.imshow(f'{nome_arquivo} - Brilho', imgBrilho)
    cv2.imshow(f'{nome_arquivo} - AdpGray2', imgAdpGray2)
    cv2.imshow(f'{nome_arquivo} - Canny', imgCanny)
    cv2.imshow(f'{nome_arquivo} - CannyInvertido', imgCannyInvertido)

    # Salva cada filtro em sua respectiva pasta
    salva_em_pasta(imgBrilho, "imgBrilho", "imgBrilho")
    salva_em_pasta(imgAdpGray2, "imgAdpGray2", "imgAdpGray2")
    salva_em_pasta(imgCanny, "imgCanny", "imgCanny")
    salva_em_pasta(imgCannyInvertido, "imgCannyInvertido", "imgCannyInvertido")

# Lista de arquivos para processar (adicione aqui os arquivos desejados)
arquivos = [
    'imagens/foto_050.jpg',
    'imagens/foto_1138.jpg',
    'imagens/foto_1246.jpg',
    'imagens/foto_1138.jpg'
]

# Processa cada arquivo da lista
for nome_arquivo in arquivos:
    processa_imagem(nome_arquivo)

# Aguarda o usuário fechar as janelas
cv2.waitKey(0)
cv2.destroyAllWindows()