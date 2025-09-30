import cv2

# Substitua pelos seus dados
usuario = 'admin'
senha = 'ULLMPG'
ip = '192.168.88.4'
porta = 554

url = f'rtsp://{usuario}:{senha}@{ip}:{porta}/cam/realmonitor?channel=1&subtype=0'

cap = cv2.VideoCapture(url)

if not cap.isOpened():
    print("Não foi possível conectar à câmera IC3.")
    exit()

while True:
    ret, frame = cap.read()
    if ret:
        cv2.imshow('IC3 Intelbras', frame)
    if cv2.waitKey(1) & 0xFF == ord(' '):
        break

cap.release()
cv2.destroyAllWindows()
