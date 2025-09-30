import cv2
import pickle
import os

# Carrega a imagem original
Recorte = cv2.imread('imgAdpGray2\imgAdpGray2_670.jpg')

# Redimensiona a imagem para largura 1024 mantendo a proporção
largura_desejada = 1024
altura_original, largura_original = Recorte.shape[:2]
escala = largura_desejada / largura_original
nova_altura = int(altura_original * escala)
Recorte_redim = cv2.resize(Recorte, (largura_desejada, nova_altura))

cv2.imshow('Imagem', Recorte_redim)

dados = []

for i in range(1):
    # Seleciona ROI na imagem redimensionada
    roi = cv2.selectROI("Imagem", Recorte_redim, fromCenter=False, showCrosshair=True)
    cv2.destroyWindow("Imagem")
    # Converte as coordenadas para a escala original
    x, y, w, h = roi
    x_orig = int(x / escala)
    y_orig = int(y / escala)
    w_orig = int(w / escala)
    h_orig = int(h / escala)
    dados.append((x_orig, y_orig, w_orig, h_orig))
    print(f"Dados do recorte {i+1}: {(x_orig, y_orig, w_orig, h_orig)}")
    if w_orig > 0 and h_orig > 0:
        recorte_img = Recorte[y_orig:y_orig+h_orig, x_orig:x_orig+w_orig]
        # Redimensiona o recorte para largura 1024 mantendo a proporção
        recorte_largura = 1024
        recorte_altura = int(recorte_img.shape[0] * (recorte_largura / recorte_img.shape[1]))
        recorte_img_redim = cv2.resize(recorte_img, (recorte_largura, recorte_altura))
        cv2.imshow(f"Recorte {i+1}", recorte_img_redim)
        # Pasta para cada coordenada
        pasta = f"coordenada{i+1}"
        os.makedirs(pasta, exist_ok=True)
        # Descobre o próximo número disponível
        arquivos = [f for f in os.listdir(pasta) if f.startswith(f"coordenada{i+1}_") and f.endswith(".jpg")]
        if arquivos:
            numeros = [int(f.split('_')[1].split('.')[0]) for f in arquivos if f.split('_')[1].split('.')[0].isdigit()]
            proximo_num = max(numeros) + 1 if numeros else 1
        else:
            proximo_num = 1
        nome_arquivo = f"{pasta}/coordenada{i+1}_{proximo_num:03d}.jpg"
        cv2.imwrite(nome_arquivo, recorte_img)
        print(f"Recorte salvo em: {nome_arquivo}")

# Salva as coordenadas dos recortes em um arquivo pickle
with open('recortes.pkl', 'wb') as f:
    pickle.dump(dados, f)
print("Coordenadas dos recortes salvas em recortes.pkl")

# Desenha os retângulos na imagem original
for x, y, w, h in dados:
    if w > 0 and h > 0:
        cv2.rectangle(Recorte, (int(x), int(y)), (int(x+w), int(y+h)), (0, 255, 0), 2)

# Redimensiona a imagem original com os retângulos para largura 1024 antes de mostrar
Recorte_marcado_redim = cv2.resize(Recorte, (largura_desejada, nova_altura))
cv2.imshow("Recortes", Recorte_marcado_redim)
cv2.waitKey(0)
cv2.destroyAllWindows()