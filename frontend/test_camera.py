#!/usr/bin/env python3
"""
Script de teste para verificar acesso às câmeras
"""
import cv2
import sys

print("=" * 50)
print("  Teste de Detecção de Câmeras")
print("=" * 50)
print()

# Testar múltiplos índices de câmera
cameras_encontradas = []

print("Testando portas de câmera (0-10)...")
print()

for i in range(11):
    print(f"Testando porta {i}...", end=" ")
    cap = cv2.VideoCapture(i)

    if cap.isOpened():
        # Tentar ler um frame
        ret, frame = cap.read()
        if ret:
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = int(cap.get(cv2.CAP_PROP_FPS))

            print(f"✓ ENCONTRADA! Resolução: {width}x{height}, FPS: {fps}")
            cameras_encontradas.append({
                'index': i,
                'width': width,
                'height': height,
                'fps': fps
            })
        else:
            print("✗ Abriu mas não leu frame")
        cap.release()
    else:
        print("✗ Não disponível")

print()
print("=" * 50)
print(f"Total de câmeras encontradas: {len(cameras_encontradas)}")
print("=" * 50)

if cameras_encontradas:
    print()
    print("Detalhes das câmeras:")
    for cam in cameras_encontradas:
        print(f"  - Câmera {cam['index']}: {cam['width']}x{cam['height']} @ {cam['fps']}fps")
else:
    print()
    print("⚠ NENHUMA CÂMERA DETECTADA!")
    print()
    print("Possíveis causas:")
    print("  1. WSL2 não tem acesso direto a dispositivos USB")
    print("  2. Webcam não está conectada")
    print("  3. Webcam está sendo usada por outro programa")
    print("  4. Permissões insuficientes")
    print()
    print("Soluções:")
    print("  1. Execute no Windows diretamente (não no WSL)")
    print("  2. Use usbipd para conectar USB ao WSL2")
    print("  3. Use modo demo com vídeo de teste")

sys.exit(0 if cameras_encontradas else 1)
