// =========================================
// VERIFICA AI
// dashboard-principal.js
// Preenche o nome real do usuário logado na saudação do topo.
// =========================================

import { pegarUsuarioAtual, pegarPerfil } from "../../services/appwrite.js";

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
        const perfil = await pegarPerfil( usuario.$id);
        if (perfil?.name) {
            elNome.textContent = perfil.name;
        }
    } catch (erro) {
        console.error("Não foi possível carregar o perfil do usuário:", erro);
    }

});
