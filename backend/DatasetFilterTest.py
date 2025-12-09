import cv2
import numpy as np

def processa_imagem(nome_arquivo):
    img = cv2.imread(nome_arquivo)
    if img is None:
        print(f"Não foi possível abrir {nome_arquivo}")
        return

    # Reduz o brilho levemente
    brilho = -40  # valor negativo reduz brilho, ajuste conforme necessário
    imgBrilhoReduzido = cv2.convertScaleAbs(img, alpha=1, beta=brilho)

    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgAdpGray = cv2.adaptiveThreshold(imgGray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    imgAdpGray2 = cv2.adaptiveThreshold(imgGray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
    imgCanny = cv2.Canny(imgGray, 100, 200)
    imgCannyInvertido = cv2.bitwise_not(imgCanny)

    # Dilatação com diferentes kernels
    kernel_quadrado = np.ones((7, 7), np.uint8)
   

    kernel_cruz = cv2.getStructuringElement(cv2.MORPH_CROSS, (1, 1))
    imgDilated_cruz = cv2.dilate(imgCanny, kernel_cruz, iterations=1)

    kernel_elipse = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (1, 1))
    imgDilated_elipse = cv2.dilate(imgCanny, kernel_elipse, iterations=1)

    # Mostra as imagens com o nome do arquivo no título
    cv2.imshow(f'{nome_arquivo} - Original', img)
    cv2.imshow(f'{nome_arquivo} - Brilho Reduzido', imgBrilhoReduzido)
    cv2.imshow(f'{nome_arquivo} - Gray', imgGray)
    cv2.imshow(f'{nome_arquivo} - Canny', imgCanny)
    cv2.imshow(f'{nome_arquivo} - Canny Invertido', imgCannyInvertido)
    cv2.imshow(f'{nome_arquivo} - Adp Gray', imgAdpGray)
    cv2.imshow(f'{nome_arquivo} - Adp Gray 2', imgAdpGray2)
    # Novas janelas para comparação dos kernels
   
    cv2.imshow(f'{nome_arquivo} - Dilated Cruz', imgDilated_cruz)
    cv2.imshow(f'{nome_arquivo} - Dilated Elipse', imgDilated_elipse)

# Lista de arquivos para processar
arquivos = [
    'imagens/foto_01.jpg',
    'imagens/foto_111.jpg',
    'imagens/foto_126.jpg',
    'imagens/foto_138.jpg'
]

for nome_arquivo in arquivos:
    processa_imagem(nome_arquivo)

cv2.waitKey(0)
cv2.destroyAllWindows()