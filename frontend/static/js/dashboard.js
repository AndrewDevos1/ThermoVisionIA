// Dashboard ThermoVision - JavaScript
// Controle de conexão de câmera e streaming de vídeo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const botaoAbrirMenu = document.getElementById("abrir-menu-mobile");
    const botaoFecharMenu = document.getElementById("fechar-menu-mobile");
    const sidebarMobile = document.getElementById("sidebar-mobile");
    const connectButton = document.getElementById("connect-button");
    const cameraStreamImg = document.getElementById("camera-stream");
    const statusDisplay = document.getElementById("status-display");
    const disconnectedMessage = document.getElementById("disconnected-message");
    const videoContainer = document.getElementById("video-container");
    const cameraSelect = document.getElementById("camera-select");
    const refreshCamerasButton = document.getElementById("refresh-cameras");
    const selectedCameraSpan = document.getElementById("selected-camera");
    const linksNavegacao = document.querySelectorAll("[data-target]");
    const secDashboard = document.getElementById("sec-dashboard");
    const secStreaming = document.getElementById("sec-streaming");
    let secaoAtual = "dashboard";

    let isConnected = false;
    let availableCameras = [];
    let selectedCameraIndex = 0;
    // URL do feed de vídeo do Flask
    const videoFeedUrl = "/video_feed";

    // Controle da navbar
    function destacarLinkAtivo(alvo) {
        linksNavegacao.forEach((link) => {
            const rota = link.dataset.target;
            const ativo = rota === alvo;
            link.classList.toggle("bg-white/10", ativo);
            link.classList.toggle("text-white", ativo);
        });
    }

    function mostrarSecao(alvo) {
        const destino = alvo === "streaming" ? "streaming" : "dashboard";
        secaoAtual = destino;

        if (secDashboard && secStreaming) {
            if (destino === "streaming") {
                secDashboard.classList.add("hidden");
                secStreaming.classList.remove("hidden");
                if (window.location.hash !== "#streaming") {
                    window.location.hash = "streaming";
                }
            } else {
                secDashboard.classList.remove("hidden");
                secStreaming.classList.add("hidden");
                if (window.location.hash) {
                    history.replaceState(null, "", window.location.pathname);
                }
            }
        }

        destacarLinkAtivo(destino);
    }

    function abrirMenuMobile() {
        if (sidebarMobile) {
            sidebarMobile.classList.remove("hidden");
            sidebarMobile.setAttribute("aria-hidden", "false");
        }
    }

    function fecharMenuMobile() {
        if (sidebarMobile) {
            sidebarMobile.classList.add("hidden");
            sidebarMobile.setAttribute("aria-hidden", "true");
        }
    }

    if (botaoAbrirMenu) {
        botaoAbrirMenu.addEventListener("click", abrirMenuMobile);
    }

    if (botaoFecharMenu) {
        botaoFecharMenu.addEventListener("click", fecharMenuMobile);
    }

    if (sidebarMobile) {
        sidebarMobile.addEventListener("click", (evento) => {
            if (evento.target === sidebarMobile) {
                fecharMenuMobile();
            }
        });
    }

    linksNavegacao.forEach((link) => {
        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            const alvo = link.dataset.target;
            mostrarSecao(alvo);
            fecharMenuMobile();
        });
    });

    const hashInicial = window.location.hash === "#streaming" ? "streaming" : "dashboard";
    mostrarSecao(hashInicial);
    window.addEventListener("hashchange", () => {
        const alvo = window.location.hash === "#streaming" ? "streaming" : "dashboard";
        mostrarSecao(alvo);
    });

    // Função para carregar lista de câmeras disponíveis
    async function loadAvailableCameras() {
        try {
            const response = await fetch("/cameras/list");
            const result = await response.json();
            
            if (result.success) {
                availableCameras = result.cameras;
                updateCameraSelect();
                console.log(`Encontradas ${result.count} câmeras:`, availableCameras);
            } else {
                console.error("Erro ao carregar câmeras:", result.message);
                cameraSelect.innerHTML = '<option value="">Erro ao carregar câmeras</option>';
            }
        } catch (error) {
            console.error("Erro na requisição de câmeras:", error);
            cameraSelect.innerHTML = '<option value="">Erro ao carregar câmeras</option>';
        }
    }

    // Função para atualizar o select de câmeras
    function updateCameraSelect() {
        cameraSelect.innerHTML = '<option value="">Selecione uma câmera...</option>';
        
        if (availableCameras.length === 0) {
            cameraSelect.innerHTML = '<option value="">Nenhuma câmera encontrada</option>';
            return;
        }

        availableCameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.index;
            option.textContent = `${camera.name} (${camera.resolution})`;
            cameraSelect.appendChild(option);
        });
    }

    // Função para atualizar o status visual
    function updateStatus(connected) {
        isConnected = connected;
        if (connected) {
            // Conectado
            cameraStreamImg.classList.remove("hidden");
            disconnectedMessage.classList.add("hidden");
            statusDisplay.textContent = "Conectada";

            statusDisplay.classList.remove(
                "bg-red-200",
                "text-red-700",
                "border-red-700",
                "bg-yellow-200",
                "text-yellow-700",
                "border-yellow-700",
            );
            statusDisplay.classList.add(
                "bg-green-200",
                "text-green-700",
                "border-green-700",
            );

            connectButton.textContent = "Desconectar Câmera";
            connectButton.classList.remove("bg-amber-500");
            connectButton.classList.add("bg-gray-500");
            
            // Atualiza informação da câmera selecionada
            const selectedCamera = availableCameras.find(cam => cam.index === selectedCameraIndex);
            selectedCameraSpan.textContent = selectedCamera ? selectedCamera.name : `Câmera ${selectedCameraIndex}`;
        } else {
            // Desconectado
            cameraStreamImg.src = ""; // Limpa a URL do stream
            cameraStreamImg.classList.add("hidden");
            disconnectedMessage.classList.remove("hidden");
            statusDisplay.textContent = "Desconectada";

            statusDisplay.classList.remove(
                "bg-green-200",
                "text-green-700",
                "border-green-700",
                "bg-yellow-200",
                "text-yellow-700",
                "border-yellow-700",
            );
            statusDisplay.classList.add(
                "bg-red-200",
                "text-red-700",
                "border-red-700",
            );

            connectButton.textContent = "Conectar Câmera";
            connectButton.classList.remove("bg-gray-500");
            connectButton.classList.add("bg-amber-500");
            
            selectedCameraSpan.textContent = "Nenhuma";
        }
    }

    // Função principal de conexão/desconexão
    connectButton.addEventListener("click", async () => {
        if (isConnected) {
            // Desconectar câmera
            try {
                const response = await fetch("/camera/disconnect", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const result = await response.json();
                
                if (result.success) {
                    updateStatus(false);
                    console.log("Câmera desconectada:", result.message);
                } else {
                    console.error("Erro ao desconectar:", result.message);
                }
            } catch (error) {
                console.error("Erro na requisição de desconexão:", error);
                updateStatus(false);
            }
        } else {
            // Verificar se uma câmera foi selecionada
            const selectedValue = cameraSelect.value;
            if (!selectedValue) {
                alert("Por favor, selecione uma câmera antes de conectar.");
                return;
            }

            selectedCameraIndex = parseInt(selectedValue);

            // Conectar câmera
            // 1. Define status como 'Conectando...'
            statusDisplay.textContent = "Conectando...";
            statusDisplay.classList.remove(
                "bg-red-200",
                "text-red-700",
                "border-red-700",
            );
            statusDisplay.classList.add(
                "bg-yellow-200",
                "text-yellow-700",
                "border-yellow-700",
            );

            try {
                // 2. Tenta conectar a câmera via API
                const response = await fetch("/camera/connect", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        camera_index: selectedCameraIndex
                    })
                });
                const result = await response.json();
                
                if (result.success) {
                    // 3. Se conexão foi bem-sucedida, inicia o stream
                    cameraStreamImg.src = videoFeedUrl;
                    
                    // 4. Verifica se o stream está funcionando
                    setTimeout(() => {
                        if (cameraStreamImg.src.endsWith(videoFeedUrl)) {
                            updateStatus(true);
                            console.log("Câmera conectada:", result.message);
                        } else {
                            updateStatus(false);
                        }
                    }, 1000);
                } else {
                    // Falha na conexão
                    updateStatus(false);
                    console.error("Erro ao conectar:", result.message);
                    alert(`Erro ao conectar: ${result.message}`);
                }
            } catch (error) {
                console.error("Erro na requisição de conexão:", error);
                updateStatus(false);
                alert("Erro ao conectar com a câmera. Verifique se ela está disponível.");
            }
        }
    });

    // Event listener para o botão de refresh de câmeras
    refreshCamerasButton.addEventListener("click", () => {
        loadAvailableCameras();
    });

    // Event listener para mudança de seleção de câmera
    cameraSelect.addEventListener("change", (e) => {
        if (isConnected) {
            alert("Desconecte a câmera atual antes de selecionar uma nova.");
            // Volta para a seleção anterior
            cameraSelect.value = selectedCameraIndex;
        }
    });

    // Função para verificar status da câmera periodicamente
    async function checkCameraStatus() {
        try {
            const response = await fetch("/camera/status");
            const result = await response.json();
            
            if (result.status === "connected" && !isConnected) {
                updateStatus(true);
                cameraStreamImg.src = videoFeedUrl;
            } else if (result.status === "disconnected" && isConnected) {
                updateStatus(false);
            }
        } catch (error) {
            console.error("Erro ao verificar status da câmera:", error);
        }
    }

    // Verifica status da câmera a cada 5 segundos
    setInterval(checkCameraStatus, 5000);

    // Inicialização
    loadAvailableCameras();
    updateStatus(false);
});
