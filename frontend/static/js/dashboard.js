// Dashboard ThermoVision - JavaScript
// Controle de conexão de câmera e streaming de vídeo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const botaoAbrirMenu = document.getElementById("abrir-menu-mobile");
    const botaoFecharMenu = document.getElementById("fechar-menu-mobile");
    const sidebarMobile = document.getElementById("sidebar-mobile");
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
    let scriptsDisponiveis = [];
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

    function travarBotoesConexao(texto = null) {
        viewerCards.forEach((viewer) => {
            if (!viewer.connectBtn) return;
            if (texto) viewer.connectBtn.textContent = texto;
            viewer.connectBtn.disabled = true;
            viewer.connectBtn.classList.add("opacity-60", "cursor-not-allowed");
        });
    }

    function liberarBotoesConexao() {
        viewerCards.forEach((viewer) => {
            if (!viewer.connectBtn) return;
            viewer.connectBtn.disabled = false;
            viewer.connectBtn.classList.remove("opacity-60", "cursor-not-allowed");
        });
    }

    function obterParamsCamera(viewer) {
        const params = {};
        if (!viewer || !viewer.select) return params;
        const val = viewer.select.value;
        if (!val) return params;
        if (val.toString().startsWith("custom-")) {
            const opt = viewer.select.selectedOptions[0];
            const rtsp = opt ? opt.dataset.rtsp : "";
            if (rtsp) params.camera_url = rtsp;
        } else {
            const idx = parseInt(val, 10);
            if (!Number.isNaN(idx)) {
                params.camera_index = idx;
            }
        }
        return params;
    }

    function parseNumero(valor) {
        if (valor === undefined || valor === null) return null;
        const n = parseInt(valor, 10);
        return Number.isNaN(n) ? null : n;
    }

    function parseLista(texto) {
        if (!texto) return [];
        return texto
            .split(/[\n;,]/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
    }

    function montarParamsScript(viewer, script) {
        const params = obterParamsCamera(viewer);
        if (viewer && viewer.outputDirInput) {
            const val = viewer.outputDirInput.value.trim();
            if (val) params.output_dir = val;
        }

        if (!script) return params;

        const card = viewer.cardEl;
        switch (script) {
            case "DatasetCut.py": {
                const imgEl = card.querySelector(".cut-input-image");
                const roiEl = card.querySelector(".cut-input-roi");
                const interactiveEl = card.querySelector(".cut-interactive");
                const countEl = card.querySelector(".cut-interactive-count");
                const previewEl = card.querySelector(".cut-preview");
                const saveEl = card.querySelector(".cut-save-crops");
                const displayEl = card.querySelector(".cut-display-width");
                if (imgEl && imgEl.value.trim()) params.input_image = imgEl.value.trim();
                if (roiEl && roiEl.value.trim()) {
                    const lista = parseLista(roiEl.value);
                    if (lista.length > 0) params.roi = lista;
                }
                if (interactiveEl) params.interactive = interactiveEl.checked;
                const qtd = countEl ? parseNumero(countEl.value) : null;
                if (qtd) params.interactive_count = qtd;
                if (previewEl) params.preview = previewEl.checked;
                if (saveEl) params.save_crops = saveEl.checked;
                const dw = displayEl ? parseNumero(displayEl.value) : null;
                if (dw) params.display_width = dw;
                break;
            }
            case "DatasetFilter.py": {
                const filesEl = card.querySelector(".filter-input-files");
                const dirEl = card.querySelector(".filter-input-dir");
                const brilhoEl = card.querySelector(".filter-brilho");
                const adpBlockEl = card.querySelector(".filter-adp-block");
                const adpCEl = card.querySelector(".filter-adp-c");
                const cannyLowEl = card.querySelector(".filter-canny-low");
                const cannyHighEl = card.querySelector(".filter-canny-high");
                if (filesEl && filesEl.value.trim()) {
                    const lista = parseLista(filesEl.value);
                    if (lista.length > 0) params.input = lista;
                }
                if (dirEl && dirEl.value.trim()) params.input_dir = dirEl.value.trim();
                const brilhoVal = brilhoEl ? parseNumero(brilhoEl.value) : null;
                if (brilhoVal !== null) params.brilho = brilhoVal;
                const blk = adpBlockEl ? parseNumero(adpBlockEl.value) : null;
                if (blk) params.adaptive_block_size = blk;
                const cVal = adpCEl ? parseNumero(adpCEl.value) : null;
                if (cVal !== null) params.adaptive_c = cVal;
                const cLow = cannyLowEl ? parseNumero(cannyLowEl.value) : null;
                if (cLow) params.canny_low = cLow;
                const cHigh = cannyHighEl ? parseNumero(cannyHighEl.value) : null;
                if (cHigh) params.canny_high = cHigh;
                break;
            }
            case "DatasetFilterApliqued.py": {
                const dirEl = card.querySelector(".filter-apl-input-dir");
                const adpBlockEl = card.querySelector(".filter-apl-adp-block");
                const adpCEl = card.querySelector(".filter-apl-adp-c");
                const cannyLowEl = card.querySelector(".filter-apl-canny-low");
                const cannyHighEl = card.querySelector(".filter-apl-canny-high");
                if (dirEl && dirEl.value.trim()) params.input_dir = dirEl.value.trim();
                const blk = adpBlockEl ? parseNumero(adpBlockEl.value) : null;
                if (blk) params.adaptive_block_size = blk;
                const cVal = adpCEl ? parseNumero(adpCEl.value) : null;
                if (cVal !== null) params.adaptive_c = cVal;
                const cLow = cannyLowEl ? parseNumero(cannyLowEl.value) : null;
                if (cLow) params.canny_low = cLow;
                const cHigh = cannyHighEl ? parseNumero(cannyHighEl.value) : null;
                if (cHigh) params.canny_high = cHigh;
                break;
            }
            case "DatasetFilterCut.py": {
                const coordsEl = card.querySelector(".cut-coords");
                const dirsEl = card.querySelector(".cut-input-dirs");
                if (coordsEl && coordsEl.value.trim()) params.coords = coordsEl.value.trim();
                if (dirsEl && dirsEl.value.trim()) {
                    const lista = parseLista(dirsEl.value);
                    if (lista.length > 0) params.input_dirs = lista;
                }
                break;
            }
            default:
                break;
        }
        return params;
    }

    function iniciarPollingLog(viewer, scriptId) {
        if (!viewer) return;
        if (viewer.logInterval) {
            clearInterval(viewer.logInterval);
        }
        viewer.currentScriptId = scriptId;
        if (viewer.downloadLogBtn) {
            viewer.downloadLogBtn.disabled = false;
            viewer.downloadLogBtn.dataset.scriptId = scriptId;
        }
        if (viewer.pararScriptBtn) {
            viewer.pararScriptBtn.disabled = false;
            viewer.pararScriptBtn.dataset.scriptId = scriptId;
        }
        const atualizar = async () => {
            try {
                const resp = await fetch(`/scripts/logs?script_id=${scriptId}`);
                const result = await resp.json();
                if (!result.success) return;
                if (viewer.logBox) {
                    viewer.logBox.textContent = result.log || "Sem logs.";
                    viewer.logBox.scrollTop = viewer.logBox.scrollHeight;
                }
                if (result.finished) {
                    clearInterval(viewer.logInterval);
                    viewer.logInterval = null;
                    if (viewer.feedbackScript) {
                        viewer.feedbackScript.textContent = `Finalizado (código ${result.return_code})`;
                    }
                    if (viewer.pararScriptBtn) {
                        viewer.pararScriptBtn.disabled = true;
                    }
                }
            } catch (e) {
                console.error("Erro ao buscar log:", e);
            }
        };
        atualizar();
        viewer.logInterval = setInterval(atualizar, 1500);
    }

    // Scripts avançados
    async function loadScripts() {
        try {
            const resp = await fetch("/scripts/list");
            const result = await resp.json();
            if (result.success) {
                scriptsDisponiveis = result.scripts || [];
                updateScriptSelects();
            } else {
                console.error("Erro ao listar scripts:", result.message);
            }
        } catch (e) {
            console.error("Erro ao buscar scripts:", e);
        }
    }

    function popularScripts(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">Selecione um script...</option>';
        if (scriptsDisponiveis.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Nenhum script encontrado";
            selectEl.appendChild(opt);
            return;
        }
        scriptsDisponiveis.forEach((nome) => {
            const opt = document.createElement("option");
            opt.value = nome;
            opt.textContent = nome;
            selectEl.appendChild(opt);
        });
    }

    function updateScriptSelects() {
        viewerCards.forEach((viewer) => {
            popularScripts(viewer.scriptSelect);
        });
    }

    function renderScriptFields(viewer, script) {
        const container = viewer.dynamicFields;
        if (!container) return;
        const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
        let html = "";
        switch (script) {
            case "DatasetCut.py":
                html = `
                    <div class="text-xs text-gray-600">Campos para DatasetCut</div>
                    <div class="p-3 border border-dashed border-gray-300 rounded-md bg-white space-y-2">
                        <label class="text-xs font-semibold text-gray-700">Carregar imagem para desenhar ROI (local, s￿ para referencia)</label>
                        <input type="file" accept="image/*" class="cut-file-input ${baseClass}">
                        <canvas class="cut-canvas w-full border border-gray-300 rounded-md" style="max-height:320px;"></canvas>
                        <div class="text-[11px] text-gray-500">Desenhe um retￂngulo no canvas; as coordenadas ser￣o preenchidas abaixo usando dimensￂo original da imagem carregada.</div>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Imagem de referencia</label>
                        <input type="text" class="cut-input-image ${baseClass}" placeholder="imagens/foto_050.jpg">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">ROIs (uma por linha: x,y,w,h)</label>
                        <textarea class="cut-input-roi ${baseClass}" rows="2" placeholder="100,50,200,150"></textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Qtd. ROIs interativas</label>
                            <input type="number" min="1" class="cut-interactive-count ${baseClass}" placeholder="1">
                        </div>
                        <label class="flex items-center gap-2 mt-6 text-xs text-gray-700">
                            <input type="checkbox" class="cut-interactive h-4 w-4"> Modo interativo
                        </label>
                        <label class="flex items-center gap-2 mt-6 text-xs text-gray-700">
                            <input type="checkbox" class="cut-preview h-4 w-4"> Mostrar preview
                        </label>
                    </div>
                    <label class="flex items-center gap-2 text-xs text-gray-700">
                        <input type="checkbox" class="cut-save-crops h-4 w-4"> Salvar recortes em coordenadaN/
                    </label>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Largura de exibicao (preview)</label>
                        <input type="number" min="100" class="cut-display-width ${baseClass}" placeholder="1024">
                    </div>
                `;
                break;
            case "DatasetFilter.py":
                html = `
                    <div class="text-xs text-gray-600">Campos para DatasetFilter</div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Arquivos (separar por virgula)</label>
                        <input type="text" class="filter-input-files ${baseClass}" placeholder="imagens/foto_050.jpg, imagens/foto_1138.jpg">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Pasta de entrada</label>
                        <input type="text" class="filter-input-dir ${baseClass}" placeholder="imagens">
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Brilho</label>
                            <input type="number" class="filter-brilho ${baseClass}" placeholder="-40">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Adaptive block</label>
                            <input type="number" class="filter-adp-block ${baseClass}" placeholder="11">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Adaptive C</label>
                            <input type="number" class="filter-adp-c ${baseClass}" placeholder="2">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Canny low</label>
                            <input type="number" class="filter-canny-low ${baseClass}" placeholder="100">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Canny high</label>
                            <input type="number" class="filter-canny-high ${baseClass}" placeholder="200">
                        </div>
                    </div>
                `;
                break;
            case "DatasetFilterApliqued.py":
                html = `
                    <div class="text-xs text-gray-600">Campos para DatasetFilterApliqued</div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Pasta de entrada</label>
                        <input type="text" class="filter-apl-input-dir ${baseClass}" placeholder="imagens">
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Adaptive block</label>
                            <input type="number" class="filter-apl-adp-block ${baseClass}" placeholder="11">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Adaptive C</label>
                            <input type="number" class="filter-apl-adp-c ${baseClass}" placeholder="2">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Canny low</label>
                            <input type="number" class="filter-apl-canny-low ${baseClass}" placeholder="100">
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-700">Canny high</label>
                            <input type="number" class="filter-apl-canny-high ${baseClass}" placeholder="200">
                        </div>
                    </div>
                `;
                break;
            case "DatasetFilterCut.py":
                html = `
                    <div class="text-xs text-gray-600">Campos para DatasetFilterCut</div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Arquivo de coordenadas</label>
                        <input type="text" class="cut-coords ${baseClass}" placeholder="recortes.pkl">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-700">Pastas de filtros (separar por virgula)</label>
                        <input type="text" class="cut-input-dirs ${baseClass}" placeholder="imgAdpGray2, imgCanny, imgCannyInvertido">
                    </div>
                `;
                break;
            default:
                html = '<div class="text-xs text-gray-600">Nenhum campo adicional.</div>';
                break;
        }
        container.innerHTML = html;
        if (script === "DatasetCut.py") {
            attachCutDrawing(container);
        }
    }

    function attachCutDrawing(container) {
        const fileInput = container.querySelector(".cut-file-input");
        const canvas = container.querySelector(".cut-canvas");
        const roiTextarea = container.querySelector(".cut-input-roi");
        if (!fileInput || !canvas || !roiTextarea) return;

        const ctx = canvas.getContext("2d");
        let img = null;
        let scaleFactor = 1;
        let startPoint = null;

        function clearCanvas() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        }

        function setCanvasSize(width, height) {
            canvas.width = width;
            canvas.height = height;
        }

        fileInput.addEventListener("change", () => {
            const file = fileInput.files ? fileInput.files[0] : null;
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const image = new Image();
                image.onload = () => {
                    img = image;
                    const maxWidth = 480;
                    const scale = image.width > maxWidth ? maxWidth / image.width : 1;
                    const cw = Math.max(50, Math.round(image.width * scale));
                    const ch = Math.max(50, Math.round(image.height * scale));
                    setCanvasSize(cw, ch);
                    scaleFactor = image.width / cw;
                    clearCanvas();
                };
                image.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        canvas.addEventListener("mousedown", (ev) => {
            if (!img) return;
            const rect = canvas.getBoundingClientRect();
            startPoint = {
                x: ev.clientX - rect.left,
                y: ev.clientY - rect.top,
            };
        });

        canvas.addEventListener("mousemove", (ev) => {
            if (!img || !startPoint) return;
            const rect = canvas.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;
            clearCanvas();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2;
            ctx.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
        });

        canvas.addEventListener("mouseup", (ev) => {
            if (!img || !startPoint) return;
            const rect = canvas.getBoundingClientRect();
            const endPoint = {
                x: ev.clientX - rect.left,
                y: ev.clientY - rect.top,
            };
            const xCanvas = Math.min(startPoint.x, endPoint.x);
            const yCanvas = Math.min(startPoint.y, endPoint.y);
            const wCanvas = Math.abs(endPoint.x - startPoint.x);
            const hCanvas = Math.abs(endPoint.y - startPoint.y);
            clearCanvas();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2;
            ctx.strokeRect(xCanvas, yCanvas, wCanvas, hCanvas);

            const xOrig = Math.round(xCanvas * scaleFactor);
            const yOrig = Math.round(yCanvas * scaleFactor);
            const wOrig = Math.round(wCanvas * scaleFactor);
            const hOrig = Math.round(hCanvas * scaleFactor);
            const linha = `${xOrig},${yOrig},${wOrig},${hOrig}`;
            roiTextarea.value = linha;
            startPoint = null;
        });
    }

    // Função para atualizar o status visual
    function updateStatus(viewer, connected, labelPersonalizado = null) {
        isConnected = connected;
        if (!viewer) return;
        const { streamImg, disconnectedMsg, connectBtn, statusBadge, selectedLabel } = viewer;

        if (connected) {
            streamImg.classList.remove("hidden");
            disconnectedMsg.classList.add("hidden");
            if (statusBadge) {
                statusBadge.textContent = "Conectada";
                statusBadge.classList.remove("bg-red-200", "text-red-700", "border-red-700", "bg-yellow-200", "text-yellow-700", "border-yellow-700");
                statusBadge.classList.add("bg-green-200", "text-green-700", "border-green-700");
            }

            if (connectBtn) {
                connectBtn.textContent = "Desconectar Câmera";
                connectBtn.disabled = false;
                connectBtn.classList.remove("bg-amber-500", "opacity-60", "cursor-not-allowed");
                connectBtn.classList.add("bg-gray-500");
            }

            let label = "Câmera conectada";
            if (labelPersonalizado) {
                label = labelPersonalizado;
            } else {
                const selecionada = availableCameras.find(cam => cam.index === selectedCameraIndex);
                if (selecionada) {
                    const res = selecionada.resolution ? ` (${selecionada.resolution})` : "";
                    label = `${selecionada.name}${res}`;
                } else {
                    label = `Câmera ${selectedCameraIndex}`;
                }
            }
            if (selectedLabel) selectedLabel.textContent = label;
        } else {
            streamImg.src = "";
            streamImg.classList.add("hidden");
            disconnectedMsg.classList.remove("hidden");
            if (statusBadge) {
                statusBadge.textContent = "Desconectada";
                statusBadge.classList.remove("bg-green-200", "text-green-700", "border-green-700", "bg-yellow-200", "text-yellow-700", "border-yellow-700");
                statusBadge.classList.add("bg-red-200", "text-red-700", "border-red-700");
            }

            if (connectBtn) {
                connectBtn.textContent = "Conectar Câmera";
                connectBtn.disabled = false;
                connectBtn.classList.remove("bg-gray-500", "opacity-60", "cursor-not-allowed");
                connectBtn.classList.add("bg-amber-500");
            }

            if (selectedLabel) selectedLabel.textContent = "Nenhuma";
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
        const removeBtn = cardEl.querySelector(".remove-viewer");
        const blocoAvancado = cardEl.querySelector(".bloco-avancado");
        const avancadoToggle = cardEl.querySelector(".avancado-toggle");
        const scriptSelect = cardEl.querySelector(".script-select");
        const refreshScriptsBtn = cardEl.querySelector(".refresh-scripts");
        const executarScriptBtn = cardEl.querySelector(".executar-script");
        const feedbackScript = cardEl.querySelector(".feedback-script");
        const logBox = cardEl.querySelector(".log-box");
        const downloadLogBtn = cardEl.querySelector(".download-log");
        const pararScriptBtn = cardEl.querySelector(".parar-script");
        const outputDirInput = cardEl.querySelector(".output-dir-input");
        const dynamicFieldsContainer = (() => {
            const existente = cardEl.querySelector(".script-dynamic-fields");
            if (existente) {
                existente.innerHTML = "";
                return existente;
            }
            const parent = outputDirInput ? outputDirInput.closest(".space-y-2") : null;
            if (!parent) return null;
            const div = document.createElement("div");
            div.className = "script-dynamic-fields space-y-2";
            parent.appendChild(div);
            return div;
        })();

        const viewer = { cardEl, select, refreshBtn, connectBtn, streamImg, disconnectedMsg, videoContainer, fullscreenBtn, statusBadge, selectedLabel, blocoAvancado, avancadoToggle, scriptSelect, refreshScriptsBtn, executarScriptBtn, feedbackScript, logBox, downloadLogBtn, pararScriptBtn, outputDirInput, dynamicFields: dynamicFieldsContainer, logInterval: null, currentScriptId: null };

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

        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                if (viewerCards.length <= 1) {
                    alert("Mantenha pelo menos uma visualização ativa.");
                    return;
                }
                if (viewer.logInterval) {
                    clearInterval(viewer.logInterval);
                }
                const idx = viewerCards.indexOf(viewer);
                if (idx !== -1) viewerCards.splice(idx, 1);
                cardEl.remove();
            });
        }

        if (avancadoToggle && blocoAvancado) {
            avancadoToggle.addEventListener("click", () => {
                blocoAvancado.classList.toggle("hidden");
            });
        }

        if (refreshScriptsBtn) {
            refreshScriptsBtn.addEventListener("click", () => {
                loadScripts();
            });
        }

        if (scriptSelect) {
            scriptSelect.addEventListener("change", () => {
                renderScriptFields(viewer, scriptSelect.value);
            });
            renderScriptFields(viewer, scriptSelect.value);
        }

        if (executarScriptBtn && scriptSelect) {
            executarScriptBtn.addEventListener("click", async () => {
                const script = scriptSelect.value;
                if (!script) {
                    alert("Selecione um script para executar.");
                    return;
                }
                if (feedbackScript) feedbackScript.textContent = "Executando...";
                if (logBox) logBox.textContent = "Iniciando...";
                const paramsCam = montarParamsScript(viewer, script);
                try {
                    const resp = await fetch("/scripts/run", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ script, params: paramsCam }),
                    });
                    const result = await resp.json();
                    if (result.success) {
                        if (feedbackScript) feedbackScript.textContent = result.message || "Script iniciado.";
                        if (result.script_id) {
                            iniciarPollingLog(viewer, result.script_id);
                        }
                    } else {
                        if (feedbackScript) feedbackScript.textContent = result.message || "Falha ao executar.";
                        alert(result.message || "Falha ao executar script.");
                    }
                } catch (e) {
                    console.error(e);
                    if (feedbackScript) feedbackScript.textContent = "Erro ao executar.";
                    alert("Erro ao executar script.");
                }
            });
        }

        if (downloadLogBtn) {
            downloadLogBtn.addEventListener("click", () => {
                const sid = downloadLogBtn.dataset.scriptId;
                if (!sid) return;
                window.open(`/scripts/logs/download?script_id=${sid}`, "_blank");
            });
        }

        if (pararScriptBtn) {
            pararScriptBtn.addEventListener("click", async () => {
                const sid = pararScriptBtn.dataset.scriptId;
                if (!sid) return;
                pararScriptBtn.disabled = true;
                try {
                    const resp = await fetch("/scripts/stop", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ script_id: sid }),
                    });
                    const result = await resp.json();
                    if (!result.success) {
                        alert(result.message || "Não foi possível interromper.");
                    } else if (feedbackScript) {
                        feedbackScript.textContent = result.message || "Processo interrompido.";
                    }
                } catch (e) {
                    console.error(e);
                    alert("Erro ao interromper script.");
                }
            });
        }

        if (connectBtn && select) {
            connectBtn.addEventListener("click", async () => {
                if (isConnected) {
                    travarBotoesConexao("Desconectando...");
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
                travarBotoesConexao("Conectando...");
                await conectarCameraUrl(cam.url, cam.nome);
                viewerCards.forEach(v => {
                    v.streamImg.src = videoFeedUrl;
                    updateStatus(v, true, cam.nome);
                });
                liberarBotoesConexao();
                return;
            }

                selectedCameraIndex = parseInt(selectedValue);
                travarBotoesConexao("Conectando...");

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
                    liberarBotoesConexao();
                } catch (error) {
                    console.error("Erro na requisição de conexão:", error);
                    viewerCards.forEach(v => updateStatus(v, false));
                    alert("Erro ao conectar com a câmera. Verifique se ela está disponível.");
                    liberarBotoesConexao();
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
            const blocoAvancado = clone.querySelector(".bloco-avancado");
            if (blocoAvancado) blocoAvancado.classList.add("hidden");
            const feedbackScript = clone.querySelector(".feedback-script");
            if (feedbackScript) feedbackScript.textContent = "Selecione um script para executar.";
            const scriptSelect = clone.querySelector(".script-select");
            if (scriptSelect) {
                scriptSelect.innerHTML = '<option value="">Selecione um script...</option>';
            }
            const logBox = clone.querySelector(".log-box");
            if (logBox) logBox.textContent = "Sem logs ainda.";
            const dynFields = clone.querySelector(".script-dynamic-fields");
            if (dynFields) dynFields.innerHTML = "";
            const downloadBtn = clone.querySelector(".download-log");
            if (downloadBtn) {
                downloadBtn.disabled = true;
                delete downloadBtn.dataset.scriptId;
            }
            const stopBtn = clone.querySelector(".parar-script");
            if (stopBtn) {
                stopBtn.disabled = true;
                delete stopBtn.dataset.scriptId;
            }

            streamingList.appendChild(clone);
            criarViewer(clone);
            updateAllSelects();
            updateScriptSelects();
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
            liberarBotoesConexao();
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
        travarBotoesConexao("Conectando...");

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
    loadScripts();
    viewerCards.forEach(v => updateStatus(v, false));
});
