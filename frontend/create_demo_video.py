#!/usr/bin/env python3
"""
Cria um vídeo de demonstração para testar o sistema sem câmera
"""
import cv2
import numpy as np
import os

print("Criando vídeo de demonstração...")

# Configurações do vídeo
width, height = 640, 480
fps = 30
duration = 10  # segundos
output_file = "demo_video.mp4"

# Criar o writer de vídeo
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))

total_frames = fps * duration

for frame_num in range(total_frames):
    # Criar um frame com gradiente de cores
    frame = np.zeros((height, width, 3), dtype=np.uint8)

    # Gradiente dinâmico
    color_shift = int((frame_num / total_frames) * 255)
    for y in range(height):
        for x in range(width):
            frame[y, x] = [
                (x * 255 // width + color_shift) % 255,
                (y * 255 // height) % 255,
                ((x + y) * 255 // (width + height) + color_shift) % 255
            ]

    # Adicionar texto
    text = f"ThermoVisionIA - Demo Mode"
    cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    text2 = f"Frame: {frame_num + 1}/{total_frames}"
    cv2.putText(frame, text2, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Adicionar um círculo animado
    center_x = int(width / 2 + 150 * np.sin(frame_num * 0.1))
    center_y = int(height / 2 + 100 * np.cos(frame_num * 0.1))
    cv2.circle(frame, (center_x, center_y), 30, (0, 255, 0), -1)

    out.write(frame)

    if (frame_num + 1) % 30 == 0:
        print(f"  Progresso: {frame_num + 1}/{total_frames} frames")

out.release()

file_size = os.path.getsize(output_file) / 1024  # KB
print(f"\n✓ Vídeo criado: {output_file}")
print(f"  Tamanho: {file_size:.1f} KB")
print(f"  Duração: {duration}s")
print(f"  Resolução: {width}x{height}")
print(f"  FPS: {fps}")
