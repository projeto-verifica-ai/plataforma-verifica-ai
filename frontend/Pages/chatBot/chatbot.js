import { analisarConteudo } from "../../js/geminiService.js";

// Referências do HTML
const chatMessages = document.getElementById("chatMessagesInner");
const chatForm = document.getElementById("chatForm");
const textInput = document.getElementById("textInput");
const fileInput = document.getElementById("fileInput");
const btnClose = document.getElementById("btnClose");
const attachmentPreview = document.getElementById("attachmentPreview");
const attachmentName = document.getElementById("attachmentName");
const removeAttachmentBtn = document.getElementById("removeAttachment");


// Feedback visual do anexo
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    attachmentName.textContent = file.name;
    attachmentPreview.hidden = false;
});


removeAttachmentBtn.addEventListener("click", () => {
    fileInput.value = "";
    attachmentPreview.hidden = true;
})

// Fechar o Chat
// caso o chat deixe de ser uma página própria e vire uma janela flutuante, será necessário ajuste.
btnClose.addEventListener("click", () => {
    // Vai para a landingpage como placeholder, pois é a unica pagina que temos ainda
    window.location.href = "../../index.html";
})


// Envio da mensagem
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = textInput.value.trim();
    const file = fileInput.files[0] || null;

    if (!text && !file) return;

    removeEmptyState();
    appendUserMessage(text, file);

    // Reseto os valores de input após enviar, para poder enviar outras mensagens
    textInput.value = "";
    fileInput.value = "";
    attachmentPreview.hidden = true;

    const loadingRow = appendLoadingRow();

    // Chamada real à API do Gemini
    try {
        const resposta = await analisarConteudo(text, file);
        loadingRow.remove();
        appendAssistantMessage(resposta);
    } catch (erro) {
        console.error(erro);
        loadingRow.remove();
        appendAssistantMessage({
            titulo: "Ops, algo deu errado.",
            paragrafos: [
                "Não consegui me conectar agora. Verifique sua conexão e tente novamente em instantes."
            ],
            subtitulo: "",
            paragrafosFinais: []
        });
    }
});

// Renderizações

function removeEmptyState() {
    const empty = document.getElementById("emptyState")
    if (empty) empty.remove();
};

// cria uma nova div para representar o chat do usuário
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

// cria uma nova div para representar o chat da IA
function appendAssistantMessage(resposta) {
    const row = document.createElement("div");
    row.className = "msg-assistant";

    const paragrafosHtml = (resposta.paragrafos || [])
        .map(p => `<p>${escapeHtml(p)}</p>`).join("");
    const paragrafosFinaisHtml = (resposta.paragrafosFinais || [])
        .map(p => `<p>${escapeHtml(p)}</p>`).join("");

    row.innerHTML = `
        <div class="assistant-avatar">
            <img src="../../assets/mascot-image/BotImageChatAI.PNG" alt="Mascote Verifica AI analisando o conteúdo" />
        </div>
        <div class="assistant-content">
            <h3>${escapeHtml(resposta.titulo)}</h3>
            ${paragrafosHtml}
            ${resposta.subtitulo ? `<h4>${escapeHtml(resposta.subtitulo)}</h4>` : ""}
            ${paragrafosFinaisHtml}
        </div>
    `;

    chatMessages.appendChild(row);

    // Rola até o TOPO da nova mensagem, não até o fim dela —
    // assim o usuário sempre começa lendo do início da resposta.
    row.scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}