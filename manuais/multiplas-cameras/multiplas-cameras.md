• Push feito da branch configurar-camera e criei a filha multiplas-cameras (já no remoto, rastreando).

  Planos para “multiplas-cameras” (frontend-only, lembrando: o backend hoje só mantém uma captura global; streams simultâneos reais exigem refatoração no Flask/
  OpenCV):

  1. HTML sec-streaming: transformar a coluna esquerda em uma lista (#streaming-list) com cartões de viewer sem IDs fixos; um botão “Adicionar outra visualização”
     cria novos cards.
  2. JS: substituir referências fixas (camera-select, video-container, etc.) por lógica baseada em template/clonagem; cada card terá seus próprios botões
     (conectar, fullscreen), mas todos usarão os mesmos endpoints. Disponibilizar câmeras nativas e custom no select de cada card.
  3. Estado: manter a disponibilidade de câmeras e a lista custom (localStorage) compartilhada. Status global (conectada/desconectada) continuará refletindo a
     última conexão, pois o backend só aceita uma câmera ativa. Vamos documentar isso na UI.
  4. Fullscreen/dblclick: manter por card.
  5. Aviso no card: “Somente uma câmera ativa por vez com backend atual; múltiplos cards compartilham a conexão”.

  Confirma se devo seguir com esse refactor no multiplas-cameras mesmo com a limitação de uma captura por vez ou se quer também que eu mexa no backend para
  suportar múltiplas conexões reais (trabalho maior).
