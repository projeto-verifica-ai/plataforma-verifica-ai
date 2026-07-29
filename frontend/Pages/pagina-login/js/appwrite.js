// =========================================
// VERIFICA AI
// appwrite.js
// Ponte entre login.js (script clássico) e o serviço compartilhado
// em ../../../services/appwrite.js (ES module).
// =========================================

import { fazerLogin } from "../../../services/appwrite.js";

window.VerificaAI = { fazerLogin };
