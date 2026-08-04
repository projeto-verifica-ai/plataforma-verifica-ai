// =========================================
// VERIFICA AI
// appwrite.js
// Ponte entre os scripts clássicos desta página (submit.js) e o
// serviço compartilhado em ../../../services/appwrite.js (ES module).
// =========================================

import { criarConta, pegarUsuarioAtual } from "../../../services/appwrite.js";

window.VerificaAI = { criarConta };

// Se o usuário já estiver logado, não faz sentido ficar na tela de
// cadastro — manda direto pro dashboard.
(async () => {
    const usuario = await pegarUsuarioAtual();

    if (usuario) {
        window.location.href = "../dashboard-principal/dashboard-principal.html";
    }
})();
