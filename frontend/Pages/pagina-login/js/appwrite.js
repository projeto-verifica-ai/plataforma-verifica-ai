// =========================================
// VERIFICA AI
// appwrite.js
// Ponte entre login.js (script clássico) e o serviço compartilhado
// em ../../../services/appwrite.js (ES module).
// =========================================

import { fazerLogin, pegarUsuarioAtual } from "../../../services/appwrite.js";

window.VerificaAI = { fazerLogin };

// Se o usuário já estiver logado, não faz sentido ficar na tela de
// login — manda direto pro dashboard.
(async () => {
    const usuario = await pegarUsuarioAtual();

    if (usuario) {
        window.location.href = "../dashboard-principal/dashboard-principal.html";
    }
})();
