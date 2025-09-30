import os
import cv2
import pickle
import time
from tqdm import tqdm
import msvcrt  # Para detectar tecla pressionada no Windows

# Função para salvar recorte sem sobrescrever arquivos
def salva_recorte(img, pasta, nome_base, pbar=None):
    os.makedirs(pasta, exist_ok=True)
    arquivos = [f for f in os.listdir(pasta) if f.startswith(nome_base) and f.endswith('.jpg')]
    if arquivos:
        numeros = [int(f.split('_')[-1].split('.')[0]) for f in arquivos if f.split('_')[-1].split('.')[0].isdigit()]
        proximo_num = max(numeros) + 1 if numeros else 1
    else:
        proximo_num = 1
    nome_arquivo = f"{pasta}/{nome_base}_{proximo_num:03d}.jpg"
    cv2.imwrite(nome_arquivo, img)
    if pbar:
        pbar.write(f"Recorte salvo: {nome_arquivo}")

# Carrega as coordenadas dos recortes
with open('recortes.pkl', 'rb') as f:
    coordenadas = pickle.load(f)  # Lista de tuplas (x, y, w, h)

# Pastas dos filtros gerados pelo DatasetFilterApliqued.py
pastas_filtros = ["imgAdpGray2", "imgCanny", "imgCannyInvertido"]

# Para cada filtro, processa todas as imagens da pasta
for pasta_filtro in pastas_filtros:
    if not os.path.exists(pasta_filtro):
        print(f"Pasta '{pasta_filtro}' não encontrada. Pulando...\n")
        continue
    arquivos = [os.path.join(pasta_filtro, f) for f in os.listdir(pasta_filtro) if f.lower().endswith('.jpg')]
    print(f"\nProcessando recortes para filtro: {pasta_filtro}")
    print("Pressione ESPAÇO a qualquer momento para interromper o processamento.\n")
    start_time = time.time()
    try:
        with tqdm(total=len(arquivos), desc=f"Recortando {pasta_filtro}", unit="img", ncols=80) as pbar:
            for nome_arquivo in arquivos:
                img = cv2.imread(nome_arquivo)
                if img is None:
                    pbar.write(f"Não foi possível abrir {nome_arquivo}")
                    pbar.update(1)
                    continue
                # Para cada coordenada, faz o recorte e salva na subpasta do filtro dentro da pasta da coordenada
                for idx, (x, y, w, h) in enumerate(coordenadas):
                    if w > 0 and h > 0:
                        recorte = img[int(y):int(y+h), int(x):int(x+w)]
                        pasta_saida = os.path.join(f"coordenada{idx+1}", pasta_filtro)
                        nome_base = f"coordenada{idx+1}_{pasta_filtro}"
                        salva_recorte(recorte, pasta_saida, nome_base, pbar)
                pbar.update(1)
                # Permite interromper com barra de espaço
                if msvcrt.kbhit():
                    if msvcrt.getch() == b' ':
                        pbar.write("\nProcessamento interrompido pelo usuário.")
                        raise KeyboardInterrupt
    except KeyboardInterrupt:
        print("\nProcessamento interrompido pelo usuário.")

    elapsed = time.time() - start_time
    minutos, segundos = divmod(int(elapsed), 60)
    print(f"\nRecortes do filtro {pasta_filtro} concluídos em {minutos}m{segundos}s.")

print("\nTodos os recortes finalizados.")