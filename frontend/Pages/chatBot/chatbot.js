/* ============================================================
   CHATBOT — Verifica AI
   Controller da interface do chatbot.
   Envia mensagens ao backend (Express) e renderiza as respostas.
   ============================================================ */


/* --------------------------------
   CONFIGURAÇÃO
   URL do servidor backend que faz proxy para a API do Gemini
   -------------------------------- */
const API_URL = "http://localhost:3000/api/analisar";


/* --------------------------------
   REFERÊNCIAS AOS ELEMENTOS DO HTML
   -------------------------------- */
const chatMessages = document.getElementById("chatMessagesInner");
const chatForm = document.getElementById("chatForm");
const textInput = document.getElementById("textInput");
const fileInput = document.getElementById("fileInput");
const btnClose = document.getElementById("btnClose");
const attachmentPreview = document.getElementById("attachmentPreview");
const attachmentName = document.getElementById("attachmentName");
const removeAttachmentBtn = document.getElementById("removeAttachment");


/* --------------------------------
   EVENTOS DE ANEXO
   Mostra/esconde o preview do arquivo selecionado
   -------------------------------- */

// Quando o usuário seleciona um arquivo, mostra o nome no preview
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    attachmentName.textContent = file.name;
    attachmentPreview.hidden = false;
});

// Remove o arquivo selecionado e esconde o preview
removeAttachmentBtn.addEventListener("click", () => {
    fileInput.value = "";
    attachmentPreview.hidden = true;
});


/* --------------------------------
   BOTÃO FECHAR
   Volta para a landing page
   -------------------------------- */
btnClose.addEventListener("click", () => {
    window.location.href = "../../index.html";
});


/* --------------------------------
   CONVERSÃO DE ARQUIVO PARA BASE64
   Necessário para enviar imagens/áudio/vídeo ao backend
   -------------------------------- */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
        reader.readAsDataURL(file);
    });
}


/* --------------------------------
   ENVIO DE MENSAGEM
   Captura o texto e/ou arquivo, envia ao backend e renderiza a resposta
   -------------------------------- */
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = textInput.value.trim();
    const file = fileInput.files[0] || null;

    // Ignora envio vazio
    if (!text && !file) return;

    // Remove o estado vazio e exibe a mensagem do usuário
    removeEmptyState();
    appendUserMessage(text, file);

    // Limpa os campos de input para a próxima mensagem
    textInput.value = "";
    fileInput.value = "";
    attachmentPreview.hidden = true;

    // Mostra animação de carregamento enquanto aguarda a IA
    const loadingRow = appendLoadingRow();

    try {
        // Monta o corpo da requisição para o backend
        const body = { texto: text || "" };

        if (file) {
            body.file = {
                mime_type: file.type,
                data: await fileToBase64(file),
            };
        }

        // Envia a requisição ao servidor Express
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const resposta = await response.json();
        loadingRow.remove();
        appendAssistantMessage(resposta);

    } catch (erro) {
        // Em caso de falha de rede, exibe mensagem genérica
        console.error(erro);
        loadingRow.remove();
        appendAssistantMessage({
            titulo: "Ops, algo deu errado.",
            paragrafos: [
                "Não consegui me conectar agora. Verifique sua conexão e tente novamente em instantes."
            ],
            subtitulo: "",
            paragrafosFinais: [],
        });
    }
});


/* ================================
   FUNÇÕES DE RENDERIZAÇÃO
   Criam e inserem os elementos HTML das mensagens
   ================================ */


// Remove o estado vazio ("Antes de confiar, verifique.")
function removeEmptyState() {
    const empty = document.getElementById("emptyState");
    if (empty) empty.remove();
}


// Cria a mensagem do usuário (balão azul + chip de anexo)
function appendUserMessage(text, file) {
    const row = document.createElement("div");
    row.className = "msg-user";

    row.innerHTML = `
        ${text ? `<div class="bubble">${escapeHtml(text)}</div>` : ""}
        ${file ? `
            <div class="attachment-chip">
                <img src="../../assets/icons/attach-white.png" alt="" />
                <span>${escapeHtml(file.name)}</span>
            </div>
        ` : ""}
    `;

    chatMessages.appendChild(row);
    row.scrollIntoView({ behavior: "smooth", block: "end" });
}


// Cria a animação de "digitando..." (três pontos pulsantes)
function appendLoadingRow() {
    const row = document.createElement("div");
    row.className = "msg-assistant";
    row.innerHTML = `
        <div class="loading-dots"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(row);
    row.scrollIntoView({ behavior: "smooth", block: "end" });
    return row;
}


// Cria a mensagem do assistente (avatar + card com selo, texto e fontes)
function appendAssistantMessage(resposta) {
    const row = document.createElement("div");
    row.className = "msg-assistant";

    // Normaliza o veredito para minúsculo
    const veredito = (resposta.veredito || "inconclusivo").toLowerCase().trim();
    const ehRecusa = resposta.status === "recusado";

    // Mapeia o veredito para texto e classe CSS do selo
    const selo = {
        falso: { texto: "Conteúdo Falso", classe: "selo-falso" },
        verdadeiro: { texto: "Conteúdo Verdadeiro", classe: "selo-verdadeiro" },
        inconclusivo: { texto: "Inconclusivo", classe: "selo-inconclusivo" },
    }[veredito] || { texto: "Inconclusivo", classe: "selo-inconclusivo" };

    // Não exibe selo em mensagens recusadas
    const seloHtml = ehRecusa
        ? ""
        : `<span class="veredito-selo ${selo.classe}">${selo.texto}</span>`;

    // Renderiza os parágrafos principais e finais
    const paragrafosHtml = (resposta.paragrafos || [])
        .map(p => `<p>${escapeHtml(p)}</p>`).join("");
    const paragrafosFinaisHtml = (resposta.paragrafosFinais || [])
        .map(p => `<p>${escapeHtml(p)}</p>`).join("");

    // Renderiza o bloco de fontes consultadas (se houver)
    const fontes = resposta.fontes || [];
    const fontesHtml = fontes.length
        ? `
            <div class="assistant-fontes">
                <h4>Fontes consultadas</h4>
                <ul>
                    ${fontes.map(f => `
                        <li>
                            <a href="${encodeURI(f.url)}" target="_blank" rel="noopener noreferrer">
                                ${escapeHtml(f.titulo || f.url)}
                            </a>
                        </li>
                    `).join("")}
                </ul>
            </div>
        `
        : "";

    // Monta o HTML completo da mensagem
    row.innerHTML = `
        <div class="assistant-avatar">
            <img src="../../assets/mascot-image/BotImageChatAI.png" alt="Mascote Verifica AI analisando o conteúdo" />
        </div>
        <div class="assistant-content">
            ${seloHtml}
            <h3 class="${ehRecusa ? "titulo-recusa" : ""}">${escapeHtml(resposta.titulo)}</h3>
            ${paragrafosHtml}
            ${resposta.subtitulo ? `<h4>${escapeHtml(resposta.subtitulo)}</h4>` : ""}
            ${paragrafosFinaisHtml}
            ${fontesHtml}
        </div>
    `;

    chatMessages.appendChild(row);
    row.scrollIntoView({ behavior: "smooth", block: "start" });
}


/* --------------------------------
   UTILITÁRIO: ESCAPE DE HTML
   Previne XSS ao exibir texto do usuário ou da API
   -------------------------------- */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
