// Dashboard ThermoVision - JavaScript
// Controle de conexão de câmera e streaming de vídeo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const botaoAbrirMenu = document.getElementById("abrir-menu-mobile");
    const botaoFecharMenu = document.getElementById("fechar-menu-mobile");
    const sidebarMobile = document.getElementById("sidebar-mobile");
    const statusDisplay = document.getElementById("status-display");
    const selectedCameraSpan = document.getElementById("selected-camera");
    const linksNavegacao = document.querySelectorAll("[data-target]");
    const secDashboard = document.getElementById("sec-dashboard");
    const secStreaming = document.getElementById("sec-streaming");
    const secAdd = document.getElementById("sec-add");
    const betaNome = document.getElementById("beta-nome");
    const betaUrl = document.getElementById("beta-url");
    const betaSalvar = document.getElementById("beta-salvar");
    const betaTestar = document.getElementById("beta-testar");
    const betaLista = document.getElementById("beta-lista");
    const betaFeedback = document.getElementById("beta-feedback");
    const betaModelo = document.getElementById("beta-modelo");
    const betaIntelbrasBloco = document.getElementById("beta-intelbras-bloco");
    const intelbrasUser = document.getElementById("intelbras-user");
    const intelbrasPass = document.getElementById("intelbras-pass");
    const intelbrasIp = document.getElementById("intelbras-ip");
    const intelbrasPort = document.getElementById("intelbras-port");
    const intelbrasAuto = document.getElementById("intelbras-auto");
    const intelbrasMontar = document.getElementById("intelbras-montar");
    const addLocalLista = document.getElementById("add-local-lista");
    const addLocalRefresh = document.getElementById("add-local-refresh");
    const streamingList = document.getElementById("streaming-list");
    const addViewerBtn = document.getElementById("add-viewer");
    let secaoAtual = "dashboard";

    let isConnected = false;
    let availableCameras = [];
    let selectedCameraIndex = 0;
    let selectedCameraLabel = "Nenhuma";
    const viewerCards = [];
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
        const destinoValido = ["dashboard", "streaming", "add"].includes(alvo) ? alvo : "dashboard";
        secaoAtual = destinoValido;

        if (secDashboard && secStreaming && secAdd) {
            secDashboard.classList.toggle("hidden", destinoValido !== "dashboard");
            secStreaming.classList.toggle("hidden", destinoValido !== "streaming");
            secAdd.classList.toggle("hidden", destinoValido !== "add");

            if (destinoValido === "streaming") {
                if (window.location.hash !== "#streaming") {
                    window.location.hash = "streaming";
                }
            } else if (destinoValido === "add") {
                if (window.location.hash !== "#add") {
                    window.location.hash = "add";
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
        : window.location.hash === "#add"
            ? "add"
            : "dashboard";
    mostrarSecao(hashInicial);
    window.addEventListener("hashchange", () => {
        const alvo = window.location.hash === "#streaming"
            ? "streaming"
            : window.location.hash === "#add"
                ? "add"
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
                updateAllSelects();
                renderizarLocais();
                console.log(`Encontradas ${result.count} câmeras:`, availableCameras);
            } else {
                console.error("Erro ao carregar câmeras:", result.message);
            }
        } catch (error) {
            console.error("Erro na requisição de câmeras:", error);
        }
    }

    function popularSelect(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">Selecione uma câmera...</option>';
        
        if (availableCameras.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Nenhuma câmera encontrada";
            selectEl.appendChild(opt);
        } else {
            availableCameras.forEach(camera => {
                const option = document.createElement('option');
                option.value = camera.index;
                const labelRes = camera.resolution ? ` (${camera.resolution})` : "";
                option.textContent = `${camera.name}${labelRes}`;
                selectEl.appendChild(option);
            });
        }

        // Inclui câmeras customizadas salvas
        const listaCustom = lerCamerasSalvas();
        listaCustom.forEach((cam, idx) => {
            const option = document.createElement('option');
            option.value = `custom-${idx}`;
            option.textContent = `${cam.nome || "Custom"} (RTSP)`;
            option.dataset.rtsp = cam.url;
            selectEl.appendChild(option);
        });
    }

    function updateAllSelects() {
        viewerCards.forEach((viewer) => popularSelect(viewer.select));
    }

    function renderizarLocais() {
        if (!addLocalLista) return;
        if (availableCameras.length === 0) {
            addLocalLista.innerHTML = '<p class="text-gray-500">Nenhuma câmera detectada.</p>';
            return;
        }
        addLocalLista.innerHTML = "";
        availableCameras.forEach((cam) => {
            const linha = document.createElement("div");
            linha.className = "p-3 border border-gray-200 rounded-lg bg-white flex flex-col gap-2";
            const labelRes = cam.resolution ? ` (${cam.resolution})` : "";
            linha.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-semibold">${cam.name}</p>
                        <p class="text-xs text-gray-500">Index: ${cam.index}${labelRes}</p>
                    </div>
                    <button class="btn-acao px-3 py-2 bg-blue-500 text-white hover:bg-blue-600" data-acao="usar-local" data-idx="${cam.index}">Usar</button>
                </div>
            `;
            addLocalLista.appendChild(linha);
        });
    }

    // Função para atualizar o status visual
    function updateStatus(viewer, connected, labelPersonalizado = null) {
        isConnected = connected;
        if (!viewer) return;
        const { streamImg, disconnectedMsg, connectBtn } = viewer;

        if (connected) {
            streamImg.classList.remove("hidden");
            disconnectedMsg.classList.add("hidden");
            statusDisplay.textContent = "Conectada";
            if (viewer.statusBadge) {
                viewer.statusBadge.textContent = "Conectada";
                viewer.statusBadge.classList.remove("bg-red-200", "text-red-700", "border-red-700");
                viewer.statusBadge.classList.add("bg-green-200", "text-green-700", "border-green-700");
            }

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

            connectBtn.textContent = "Desconectar Câmera";
            connectBtn.classList.remove("bg-amber-500");
            connectBtn.classList.add("bg-gray-500");
            
            if (labelPersonalizado) {
                selectedCameraSpan.textContent = labelPersonalizado;
                selectedCameraLabel = labelPersonalizado;
                if (viewer.selectedLabel) viewer.selectedLabel.textContent = labelPersonalizado;
            } else {
                const selectedCamera = availableCameras.find(cam => cam.index === selectedCameraIndex);
                selectedCameraSpan.textContent = selectedCamera ? selectedCamera.name : `Câmera ${selectedCameraIndex}`;
                selectedCameraLabel = selectedCamera ? selectedCamera.name : `Câmera ${selectedCameraIndex}`;
                if (viewer.selectedLabel) viewer.selectedLabel.textContent = selectedCameraLabel;
            }
        } else {
            streamImg.src = ""; // Limpa a URL do stream
            streamImg.classList.add("hidden");
            disconnectedMsg.classList.remove("hidden");
            statusDisplay.textContent = "Desconectada";
            if (viewer.statusBadge) {
                viewer.statusBadge.textContent = "Desconectada";
                viewer.statusBadge.classList.remove("bg-green-200", "text-green-700", "border-green-700", "bg-yellow-200", "text-yellow-700", "border-yellow-700");
                viewer.statusBadge.classList.add("bg-red-200", "text-red-700", "border-red-700");
            }

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

            connectBtn.textContent = "Conectar Câmera";
            connectBtn.classList.remove("bg-gray-500");
            connectBtn.classList.add("bg-amber-500");
            
            selectedCameraSpan.textContent = "Nenhuma";
            selectedCameraLabel = "Nenhuma";
            if (viewer.selectedLabel) viewer.selectedLabel.textContent = "Nenhuma";
        }
    }

    // Controle de viewers
    function criarViewer(cardEl) {
        const select = cardEl.querySelector(".camera-select");
        const refreshBtn = cardEl.querySelector(".refresh-cameras");
        const connectBtn = cardEl.querySelector(".connect-button");
        const streamImg = cardEl.querySelector(".camera-stream");
        const disconnectedMsg = cardEl.querySelector(".disconnected-message");
        const videoContainer = cardEl.querySelector(".video-container");
        const fullscreenBtn = cardEl.querySelector(".fullscreen-btn");
        const statusBadge = cardEl.querySelector(".viewer-status");
        const selectedLabel = cardEl.querySelector(".viewer-selected");

        const viewer = { cardEl, select, refreshBtn, connectBtn, streamImg, disconnectedMsg, videoContainer, fullscreenBtn, statusBadge, selectedLabel };

        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                loadAvailableCameras();
            });
        }

        if (fullscreenBtn && videoContainer) {
            fullscreenBtn.addEventListener("click", () => {
                if (!document.fullscreenElement) {
                    videoContainer.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });

            videoContainer.addEventListener("dblclick", () => {
                if (!document.fullscreenElement) {
                    videoContainer.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        if (connectBtn && select) {
            connectBtn.addEventListener("click", async () => {
                if (isConnected) {
                    try {
                        const response = await fetch("/camera/disconnect", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                        });
                        const result = await response.json();
                        if (result.success) {
                            viewerCards.forEach(v => updateStatus(v, false));
                            console.log("Câmera desconectada:", result.message);
                        } else {
                            console.error("Erro ao desconectar:", result.message);
                        }
                    } catch (error) {
                        console.error("Erro na requisição de desconexão:", error);
                        viewerCards.forEach(v => updateStatus(v, false));
                    }
                    return;
                }

                const selectedValue = select.value;
                if (!selectedValue) {
                    alert("Por favor, selecione uma câmera antes de conectar.");
                    return;
                }

                // Custom RTSP
                if (selectedValue.startsWith("custom-")) {
                    const idx = parseInt(selectedValue.replace("custom-", ""), 10);
                    const lista = lerCamerasSalvas();
                    const cam = lista[idx];
                    if (!cam) {
                        alert("Câmera customizada não encontrada.");
                        return;
                    }
                    await conectarCameraUrl(cam.url, cam.nome);
                    viewerCards.forEach(v => {
                        v.streamImg.src = videoFeedUrl;
                        updateStatus(v, true, cam.nome);
                    });
                    return;
                }

                selectedCameraIndex = parseInt(selectedValue);
                statusDisplay.textContent = "Conectando...";
                statusDisplay.classList.remove("bg-red-200", "text-red-700", "border-red-700");
                statusDisplay.classList.add("bg-yellow-200", "text-yellow-700", "border-yellow-700");

                try {
                    const response = await fetch("/camera/connect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ camera_index: selectedCameraIndex })
                    });
                    const result = await response.json();
                    
                    if (result.success) {
                        viewerCards.forEach(v => {
                            v.streamImg.src = videoFeedUrl;
                            updateStatus(v, true);
                        });
                        console.log("Câmera conectada:", result.message);
                    } else {
                        viewerCards.forEach(v => updateStatus(v, false));
                        console.error("Erro ao conectar:", result.message);
                        alert(`Erro ao conectar: ${result.message}`);
                    }
                } catch (error) {
                    console.error("Erro na requisição de conexão:", error);
                    viewerCards.forEach(v => updateStatus(v, false));
                    alert("Erro ao conectar com a câmera. Verifique se ela está disponível.");
                }
            });
        }

        if (select) {
            select.addEventListener("change", () => {
                if (isConnected) {
                    alert("Desconecte a câmera atual antes de selecionar uma nova.");
                    select.value = selectedCameraIndex;
                }
            });
        }

        viewerCards.push(viewer);
    }

    // Inicializa viewers existentes
    if (streamingList) {
        streamingList.querySelectorAll(".viewer-card").forEach((card) => {
            criarViewer(card);
        });
    }

    if (addViewerBtn && streamingList) {
        addViewerBtn.addEventListener("click", () => {
            const template = streamingList.querySelector(".viewer-card");
            if (!template) return;
            const clone = template.cloneNode(true);
            // Reset estado visual
            clone.querySelectorAll("img.camera-stream").forEach(img => {
                img.src = "";
                img.classList.add("hidden");
            });
            clone.querySelectorAll(".disconnected-message").forEach(msg => msg.classList.remove("hidden"));
            const select = clone.querySelector(".camera-select");
            if (select) {
                select.innerHTML = '<option value="">Carregando câmeras...</option>';
            }
            const statusB = clone.querySelector(".viewer-status");
            if (statusB) {
                statusB.textContent = "Desconectada";
                statusB.classList.remove("bg-green-200", "text-green-700", "border-green-700", "bg-yellow-200", "text-yellow-700", "border-yellow-700");
                statusB.classList.add("bg-red-200", "text-red-700", "border-red-700");
            }
            const selectedLbl = clone.querySelector(".viewer-selected");
            if (selectedLbl) selectedLbl.textContent = "Nenhuma";

            streamingList.appendChild(clone);
            criarViewer(clone);
            updateAllSelects();
        });
    }

    // Função para verificar status da câmera periodicamente
    async function checkCameraStatus() {
        try {
            const response = await fetch("/camera/status");
            const result = await response.json();
            
            if (result.status === "connected" && !isConnected) {
                viewerCards.forEach(v => {
                    v.streamImg.src = videoFeedUrl;
                    updateStatus(v, true);
                });
            } else if (result.status === "disconnected" && isConnected) {
                viewerCards.forEach(v => updateStatus(v, false));
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
    const INTELBRAS_DEFAULT = {
        usuario: "admin",
        senha: "Kaiser@210891",
        ip: "192.168.88.110",
        porta: "554",
    };

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
                selectedCameraIndex = -1;
                viewerCards.forEach(v => {
                    v.streamImg.src = videoFeedUrl;
                    updateStatus(v, true, nomeExibicao || "RTSP customizado");
                });
                console.log("Câmera custom conectada:", result.message);
                setBetaFeedback(result.message || "Conectado com sucesso.", "ok");
            } else {
                viewerCards.forEach(v => updateStatus(v, false));
                setBetaFeedback(result.message || "Falha ao conectar.", "erro");
            }
        } catch (e) {
            console.error(e);
            viewerCards.forEach(v => updateStatus(v, false));
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

    function atualizarVisibilidadeModelo() {
        if (!betaModelo || !betaIntelbrasBloco) return;
        betaIntelbrasBloco.classList.toggle("hidden", betaModelo.value !== "intelbras");
    }

    function montarUrlIntelbras() {
        const user = intelbrasUser.value.trim();
        const pwd = intelbrasPass.value.trim();
        const ip = intelbrasIp.value.trim();
        const port = intelbrasPort.value.trim() || "554";
        if (!user || !pwd || !ip) {
            setBetaFeedback("Preencha usuário, senha e IP para montar a URL Intelbras.", "erro");
            return;
        }
        const url = `rtsp://${user}:${pwd}@${ip}:${port}/cam/realmonitor?channel=1&subtype=0`;
        betaUrl.value = url;
        if (!betaNome.value.trim()) {
            betaNome.value = "Intelbras RTSP";
        }
        setBetaFeedback("URL Intelbras montada.", "ok");
    }

    if (betaModelo) {
        betaModelo.addEventListener("change", atualizarVisibilidadeModelo);
        atualizarVisibilidadeModelo();
    }

    if (intelbrasAuto) {
        intelbrasAuto.addEventListener("click", (e) => {
            e.preventDefault();
            intelbrasUser.value = INTELBRAS_DEFAULT.usuario;
            intelbrasPass.value = INTELBRAS_DEFAULT.senha;
            intelbrasIp.value = INTELBRAS_DEFAULT.ip;
            intelbrasPort.value = INTELBRAS_DEFAULT.porta;
            setBetaFeedback("Campos Intelbras preenchidos.", "info");
        });
    }

    if (intelbrasMontar) {
        intelbrasMontar.addEventListener("click", (e) => {
            e.preventDefault();
            montarUrlIntelbras();
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

    if (addLocalLista) {
        addLocalLista.addEventListener("click", (e) => {
            const botao = e.target.closest("button");
            if (!botao) return;
            if (botao.dataset.acao === "usar-local") {
                const idx = parseInt(botao.dataset.idx, 10);
                const primeiro = viewerCards[0];
                if (primeiro && primeiro.select) {
                    primeiro.select.value = idx;
                    primeiro.connectBtn.click();
                }
            }
        });
    }

    if (addLocalRefresh) {
        addLocalRefresh.addEventListener("click", () => {
            loadAvailableCameras();
        });
    }

    renderizarCameras();
    // ----------------------------

    // Inicialização
    loadAvailableCameras();
    viewerCards.forEach(v => updateStatus(v, false));
});
