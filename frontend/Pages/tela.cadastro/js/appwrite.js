// =========================================
// VERIFICA AI
// appwrite.js
// Ponte entre os scripts clássicos desta página (submit.js) e o
// serviço compartilhado em ../../../services/appwrite.js (ES module).
// =========================================

import { criarConta } from "../../../services/appwrite.js";

window.VerificaAI = { criarConta };
