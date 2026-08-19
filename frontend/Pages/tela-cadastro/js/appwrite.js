// =========================================
// VERIFICA AI
// appwrite.js
// Ponte entre os scripts clássicos desta página (submit.js) e o
// serviço compartilhado em ../../../services/appwrite.js (ES module).
// =========================================

import { criarConta, loginComOAuth, pegarUsuarioAtual } from "../../../services/appwrite.js";

window.VerificaAI = { criarConta, loginComOAuth };

// Se o usuário já estiver logado, não faz sentido ficar na tela de
// cadastro — manda direto pro dashboard.
(async () => {
    const usuario = await pegarUsuarioAtual();

    if (usuario) {
        window.location.href = "../dashboard-principal/dashboard-principal.html";
    }
})();

// Cadastro/login via Facebook ou Google (módulo roda depois que o
// HTML já foi parseado, então os botões já existem no DOM aqui).
document.querySelector(".social-btn.facebook")?.addEventListener("click", () => {
    loginComOAuth("facebook");
});

document.querySelector(".social-btn.google")?.addEventListener("click", () => {
    loginComOAuth("google");
});
