import cv2
import numpy as np
import os

def salva_em_pasta(img, pasta, nome_base):
    os.makedirs(pasta, exist_ok=True)
    arquivos = [f for f in os.listdir(pasta) if f.startswith(nome_base) and f.endswith('.jpg')]
    if arquivos:
        numeros = [int(f.split('_')[1].split('.')[0]) for f in arquivos if f.split('_')[1].split('.')[0].isdigit()]
        proximo_num = max(numeros) + 1 if numeros else 1
    else:
        proximo_num = 1
    nome_arquivo = f"{pasta}/{nome_base}_{proximo_num:03d}.jpg"
    cv2.imwrite(nome_arquivo, img)
    print(f"Imagem salva: {nome_arquivo}")

def processa_imagem(nome_arquivo):
    img = cv2.imread(nome_arquivo)
    if img is None:
        print(f"Não foi possível abrir {nome_arquivo}")
        return

    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgAdpGray2 = cv2.adaptiveThreshold(
        imgGray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
    imgCanny = cv2.Canny(imgGray, 100, 200)
    imgCannyInvertido = cv2.bitwise_not(imgCanny)

    # Exibe as imagens para visualização
    cv2.imshow(f'{nome_arquivo} - AdpGray2', imgAdpGray2)
    cv2.imshow(f'{nome_arquivo} - Canny', imgCanny)
    cv2.imshow(f'{nome_arquivo} - CannyInvertido', imgCannyInvertido)

    # Salva cada filtro em sua respectiva pasta
    salva_em_pasta(imgAdpGray2, "imgAdpGray2", "imgAdpGray2")
    salva_em_pasta(imgCanny, "imgCanny", "imgCanny")
    salva_em_pasta(imgCannyInvertido, "imgCannyInvertido", "imgCannyInvertido")

# Lista de arquivos para processar
arquivos = [
    'imagens/foto_050.jpg',
    'imagens/foto_1138.jpg',
    'imagens/foto_1246.jpg',
    'imagens/foto_1138.jpg'
]

for nome_arquivo in arquivos:
    processa_imagem(nome_arquivo)

cv2.waitKey(0)
cv2.destroyAllWindows()