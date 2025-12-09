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
    const secBeta = document.getElementById("sec-beta");
    const betaNome = document.getElementById("beta-nome");
    const betaUrl = document.getElementById("beta-url");
    const betaSalvar = document.getElementById("beta-salvar");
    const betaTestar = document.getElementById("beta-testar");
    const betaLista = document.getElementById("beta-lista");
    const betaFeedback = document.getElementById("beta-feedback");
    let secaoAtual = "dashboard";

    let isConnected = false;
    let availableCameras = [];
    let selectedCameraIndex = 0;
    let selectedCameraLabel = "Nenhuma";
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
        const destinoValido = ["dashboard", "streaming", "beta"].includes(alvo) ? alvo : "dashboard";
        secaoAtual = destinoValido;

        if (secDashboard && secStreaming && secBeta) {
            secDashboard.classList.toggle("hidden", destinoValido !== "dashboard");
            secStreaming.classList.toggle("hidden", destinoValido !== "streaming");
            secBeta.classList.toggle("hidden", destinoValido !== "beta");

            if (destinoValido === "streaming") {
                if (window.location.hash !== "#streaming") {
                    window.location.hash = "streaming";
                }
            } else if (destinoValido === "beta") {
                if (window.location.hash !== "#beta") {
                    window.location.hash = "beta";
                }
            } else {
                if (window.location.hash) {
                    history.replaceState(null, "", window.location.pathname);
                }
            }
        }

        destacarLinkAtivo(destinoValido);
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

    const hashInicial = window.location.hash === "#streaming"
        ? "streaming"
        : window.location.hash === "#beta"
            ? "beta"
            : "dashboard";
    mostrarSecao(hashInicial);
    window.addEventListener("hashchange", () => {
        const alvo = window.location.hash === "#streaming"
            ? "streaming"
            : window.location.hash === "#beta"
                ? "beta"
                : "dashboard";
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
    function updateStatus(connected, labelPersonalizado = null) {
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
            if (labelPersonalizado) {
                selectedCameraSpan.textContent = labelPersonalizado;
                selectedCameraLabel = labelPersonalizado;
            } else {
                const selectedCamera = availableCameras.find(cam => cam.index === selectedCameraIndex);
                selectedCameraSpan.textContent = selectedCamera ? selectedCamera.name : `Câmera ${selectedCameraIndex}`;
                selectedCameraLabel = selectedCamera ? selectedCamera.name : `Câmera ${selectedCameraIndex}`;
            }
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
            selectedCameraLabel = "Nenhuma";
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

    // ----------------------------
    // Beta Test - câmeras customizadas
    // ----------------------------
    const LS_KEY_BETA = "thermo_beta_cameras";

    function setBetaFeedback(mensagem, tipo = "info") {
        if (!betaFeedback) return;
        const cores = {
            info: "text-gray-700",
            ok: "text-green-700",
            erro: "text-red-700",
        };
        betaFeedback.className = `text-sm ${cores[tipo] || cores.info}`;
        betaFeedback.textContent = mensagem;
    }

    function lerCamerasSalvas() {
        try {
            const salvo = localStorage.getItem(LS_KEY_BETA);
            if (!salvo) return [];
            return JSON.parse(salvo);
        } catch (e) {
            console.error("Erro ao ler câmeras salvas:", e);
            return [];
        }
    }

    function salvarCameras(lista) {
        localStorage.setItem(LS_KEY_BETA, JSON.stringify(lista));
    }

    function renderizarCameras() {
        if (!betaLista) return;
        const lista = lerCamerasSalvas();
        if (lista.length === 0) {
            betaLista.innerHTML = '<p class="text-gray-500">Nenhuma câmera cadastrada ainda.</p>';
            return;
        }

        betaLista.innerHTML = "";
        lista.forEach((cam, idx) => {
            const linha = document.createElement("div");
            linha.className = "p-3 border border-gray-200 rounded-lg bg-white flex flex-col gap-2";
            linha.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-semibold">${cam.nome || "Sem nome"}</p>
                        <p class="text-xs text-gray-500 break-all">${cam.url}</p>
                    </div>
                    <span class="text-[11px] text-gray-500">#${idx + 1}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button class="btn-acao px-3 py-2 bg-blue-500 text-white hover:bg-blue-600" data-acao="usar" data-idx="${idx}">Usar no streaming</button>
                    <button class="btn-acao px-3 py-2 bg-gray-200 text-zinc-900 hover:bg-gray-300" data-acao="testar" data-idx="${idx}">Testar</button>
                    <button class="btn-acao px-3 py-2 bg-red-500 text-white hover:bg-red-600" data-acao="remover" data-idx="${idx}">Remover</button>
                </div>
            `;
            betaLista.appendChild(linha);
        });
    }

    async function testarCameraUrl(url) {
        if (!url) {
            setBetaFeedback("Informe uma URL RTSP para testar.", "erro");
            return;
        }
        setBetaFeedback("Testando conexão...", "info");
        try {
            const resp = await fetch("/camera/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ camera_url: url }),
            });
            const result = await resp.json();
            if (result.success) {
                setBetaFeedback(result.message || "Conexão OK.", "ok");
            } else {
                setBetaFeedback(result.message || "Falha ao testar conexão.", "erro");
            }
        } catch (e) {
            console.error(e);
            setBetaFeedback("Erro ao testar conexão.", "erro");
        }
    }

    async function conectarCameraUrl(url, nomeExibicao) {
        if (!url) {
            setBetaFeedback("Informe uma URL RTSP para conectar.", "erro");
            return;
        }

        statusDisplay.textContent = "Conectando...";
        statusDisplay.classList.remove("bg-red-200", "text-red-700", "border-red-700");
        statusDisplay.classList.add("bg-yellow-200", "text-yellow-700", "border-yellow-700");

        try {
            const resp = await fetch("/camera/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ camera_url: url }),
            });
            const result = await resp.json();
            if (result.success) {
                cameraStreamImg.src = videoFeedUrl;
                selectedCameraIndex = -1;
                setTimeout(() => {
                    updateStatus(true, nomeExibicao || "RTSP customizado");
                    console.log("Câmera custom conectada:", result.message);
                }, 500);
                setBetaFeedback(result.message || "Conectado com sucesso.", "ok");
            } else {
                updateStatus(false);
                setBetaFeedback(result.message || "Falha ao conectar.", "erro");
            }
        } catch (e) {
            console.error(e);
            updateStatus(false);
            setBetaFeedback("Erro ao conectar.", "erro");
        }
    }

    function removerCamera(idx) {
        const lista = lerCamerasSalvas();
        const nova = lista.filter((_, i) => i !== idx);
        salvarCameras(nova);
        renderizarCameras();
        setBetaFeedback("Câmera removida.", "info");
    }

    if (betaSalvar) {
        betaSalvar.addEventListener("click", (e) => {
            e.preventDefault();
            const nome = betaNome.value.trim();
            const url = betaUrl.value.trim();
            if (!url) {
                setBetaFeedback("Preencha a URL RTSP para salvar.", "erro");
                return;
            }
            const lista = lerCamerasSalvas();
            lista.push({ nome: nome || "Sem nome", url });
            salvarCameras(lista);
            renderizarCameras();
            setBetaFeedback("Câmera salva localmente.", "ok");
        });
    }

    if (betaTestar) {
        betaTestar.addEventListener("click", (e) => {
            e.preventDefault();
            const url = betaUrl.value.trim();
            testarCameraUrl(url);
        });
    }

    if (betaLista) {
        betaLista.addEventListener("click", (e) => {
            const botao = e.target.closest("button");
            if (!botao) return;
            const acao = botao.dataset.acao;
            const idx = parseInt(botao.dataset.idx, 10);
            const lista = lerCamerasSalvas();
            const cam = lista[idx];
            if (!cam) return;

            if (acao === "usar") {
                conectarCameraUrl(cam.url, cam.nome);
            } else if (acao === "testar") {
                testarCameraUrl(cam.url);
            } else if (acao === "remover") {
                removerCamera(idx);
            }
        });
    }

    renderizarCameras();
    // ----------------------------

    // Inicialização
    loadAvailableCameras();
    updateStatus(false);
});
