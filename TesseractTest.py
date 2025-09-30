import cv2
import pytesseract as pt

# Configurações do Tesseract
pt.pytesseract.tesseract_cmd = r'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe'

# img = cv2.imread('imagens/foto_006.jpg')

img = cv2.imread('coordenada1\coordenada1_010.jpg')

print(pt.pytesseract.image_to_string(img, lang='eng'))

cv2.imshow('Imagem', img)
print("Pressione ESPAÇO para sair do programa.")

while True:
    if cv2.waitKey(1) & 0xFF == ord(' '):
        print("Programa finalizado pelo usuário.")
        break

cv2.destroyAllWindows()