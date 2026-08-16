// =========================================
// VERIFICA AI
// dashboard-principal.js
// Preenche o nome real do usuário logado na saudação do topo.
// =========================================

import { pegarUsuarioAtual, garantirPerfil } from "../../services/appwrite.js";

document.addEventListener("DOMContentLoaded", async () => {

    const elNome = document.getElementById("boas-vindas-nome");

    let usuario;
    try {
        usuario = await pegarUsuarioAtual();
    } catch {
        usuario = null;
    }

    if (!usuario) {
        elNome.textContent = "visitante";
        return;
    }

    elNome.textContent = usuario.name;

    try {
        // Login via Facebook/Google não passa pelo criarConta, então
        // pode ser a primeira vez que esse usuário aparece por aqui —
        // garantirPerfil cria a linha em "profiles" se ainda não existir.
        const perfil = await garantirPerfil(usuario);
        if (perfil?.name) {
            elNome.textContent = perfil.name;
        }
    } catch (erro) {
        console.error("Não foi possível carregar o perfil do usuário:", erro);
    }

});
