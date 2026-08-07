// =========================================
// VERIFICA AI
// perfil.js
// Preenche a tela de perfil com dados do Appwrite.
// =========================================

import {
    pegarUsuarioAtual,
    pegarPerfil,
    pegarUrlAvatar,
    pegarRespostasUsuario,
    fazerLogout,
} from "../../services/appwrite.js";

const elAvatar = document.getElementById("perfil-avatar");
const elAvatarImg = document.getElementById("avatar-img");
const elNome = document.getElementById("perfil-nome");
const elEmail = document.getElementById("perfil-email");
const elMembroDesde = document.getElementById("perfil-membro-desde");
const elConcluidos = document.getElementById("perfil-concluidos");
const elQuizzes = document.getElementById("perfil-quizzes");
const elProgresso = document.getElementById("perfil-progresso");
const elTrilho = document.getElementById("perfil-progresso-trilho");
const elStatus = document.getElementById("perfil-status");
const elBtnSair = document.getElementById("btn-sair-conta");
const botoesEmBreve = document.querySelectorAll(".perfil-acao[data-acao]");

let usuarioAtual = null;

function limparFallbackAvatar() {
    const elIniciais = elAvatar.querySelector(".perfil-avatar__iniciais");
    if (elIniciais) {
        elIniciais.remove();
    }
}

function mostrarIniciaisAvatar(iniciais) {
    if (elAvatarImg) {
        elAvatarImg.hidden = true;
    }

    let elIniciais = elAvatar.querySelector(".perfil-avatar__iniciais");
    if (!elIniciais) {
        elIniciais = document.createElement("span");
        elIniciais.className = "perfil-avatar__iniciais";
        elIniciais.setAttribute("aria-hidden", "true");
        elAvatar.appendChild(elIniciais);
    }

    elIniciais.textContent = iniciais;
}

function formatarMesAno(isoString) {
    if (!isoString) return "-";

    const data = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
    }).format(data);
}

function atualizarAvatar(nome, avatarUrl) {
    const iniciais = (nome || "V")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("") || "V";

    limparFallbackAvatar();

    if (!elAvatarImg) {
        mostrarIniciaisAvatar(iniciais);
        return;
    }

    if (avatarUrl) {
        elAvatarImg.hidden = false;
        elAvatarImg.alt = "Foto de perfil";
        elAvatarImg.onload = null;
        elAvatarImg.onerror = () => {
            mostrarIniciaisAvatar(iniciais);
        };
        elAvatarImg.src = avatarUrl;
        return;
    }

    mostrarIniciaisAvatar(iniciais);
}

function atualizarProgresso(concluidos, quizzesRealizados) {
    const percentual = quizzesRealizados === 0
        ? 0
        : Math.round((concluidos / quizzesRealizados) * 100);

    elConcluidos.textContent = concluidos;
    elQuizzes.textContent = quizzesRealizados;
    elProgresso.textContent = percentual;
    elTrilho.value = percentual;
}

async function carregarPerfil() {
    try {
        usuarioAtual = await pegarUsuarioAtual();
    } catch {
        usuarioAtual = null;
    }

    if (!usuarioAtual) {
        elNome.textContent = "Visitante";
        elEmail.textContent = "Entre para acessar seu perfil.";
        elMembroDesde.textContent = "-";
        atualizarAvatar("Visitante", null);
        atualizarProgresso(0, 0);
        elStatus.textContent = "Você precisa entrar para ver os dados da conta.";
        return;
    }

    let nome = usuarioAtual.name || "Usuário";
    let email = usuarioAtual.email || "";
    let avatarUrl = null;

    try {
        const perfil = await pegarPerfil(usuarioAtual.$id);
        if (perfil?.name) {
            nome = perfil.name;
        }
        if (perfil?.avatarField) {
            avatarUrl = pegarUrlAvatar(perfil.avatarField);
        }
    } catch (error_) {
        console.error("Não foi possível carregar o perfil do usuário:", error_);
    }

    atualizarAvatar(nome, avatarUrl);
    elNome.textContent = nome;
    elEmail.textContent = email || "Conta conectada com sucesso.";
    elMembroDesde.textContent = formatarMesAno(usuarioAtual.$createdAt || usuarioAtual.registration);

    let respostas = [];
    try {
        respostas = await pegarRespostasUsuario(usuarioAtual.$id);
    } catch (error_) {
        console.error("Não foi possível carregar o progresso do usuário:", error_);
    }

    const quizzesRealizados = respostas.length;
    const concluidos = respostas.filter((resposta) => resposta.correct).length;
    atualizarProgresso(concluidos, quizzesRealizados);
}

elBtnSair.addEventListener("click", async () => {
    elStatus.textContent = "Encerrando a sessão...";

    try {
        await fazerLogout();
    } catch (error_) {
        console.error("Não foi possível encerrar a sessão:", error_);
    }

    window.location.href = "../pagina-login/pagina-login.html";
});

botoesEmBreve.forEach((botao) => {
    botao.addEventListener("click", () => {
        if (botao.id === "btn-sair-conta") return;
        elStatus.textContent = "Essa funcionalidade ainda não está disponível nesta etapa.";
    });
});

document.addEventListener("DOMContentLoaded", carregarPerfil);