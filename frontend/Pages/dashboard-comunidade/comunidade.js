// =========================================
// VERIFICA AI
// comunidade.js
// Publica e lista as mensagens da comunidade.
// =========================================

import {
    pegarUsuarioAtual,
    pegarPerfil,
    criarPublicacao,
    listarPublicacoes,
} from "../../services/appwrite.js";

const elFeedList = document.getElementById("feed-list");
const elFeedEmpty = document.getElementById("feed-empty");
const elPubTexto = document.getElementById("pub-texto");
const elPubLink = document.getElementById("pub-link");
const elBtnPublicar = document.getElementById("btn-publicar");
const elBtnNovaPub = document.getElementById("btn-nova-pub");
const elPubErro = document.getElementById("pub-erro");

let usuarioAtual = null;

// Ação para ecnonomia de memoria, é salvo no cache os perfis para agilizar o mapeamento
const cachePerfis = new Map(); // userId -> { name, avatarField } | null

async function pegarPerfilComCache(userId) {
    if (cachePerfis.has(userId)) return cachePerfis.get(userId);

    const perfil = await pegarPerfil(userId).catch(() => null);
    cachePerfis.set(userId, perfil);
    return perfil;
}

//Inserção e formatação das datas de publicação
function formatarData(isoString) {
    const data = new Date(isoString);
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

//Cria o item da publicação no feed da comunidade
async function criarItemFeed(publicacao) {
    const perfil = await pegarPerfilComCache(publicacao.userId);
    const nomeAutor = perfil?.name || "Usuário";

    const li = document.createElement("li");
    li.className = "feed-item";

    const avatar = document.createElement("div");
    avatar.className = "feed-item__avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = nomeAutor.charAt(0).toUpperCase();

    const corpo = document.createElement("div");
    corpo.className = "feed-item__body";

    const cabecalho = document.createElement("p");
    const autorEl = document.createElement("span");
    autorEl.className = "feed-item__autor";
    autorEl.textContent = nomeAutor;
    const dataEl = document.createElement("span");
    dataEl.className = "feed-item__data";
    dataEl.textContent = formatarData(publicacao.$createdAt);
    cabecalho.append(autorEl, dataEl);

    const texto = document.createElement("p");
    texto.className = "feed-item__texto";
    texto.textContent = publicacao.text;

    corpo.append(cabecalho, texto);

    if (publicacao.link) {
        const link = document.createElement("a");
        link.className = "feed-item__link";
        link.href = publicacao.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = publicacao.link;
        corpo.appendChild(link);
    }

    li.append(avatar, corpo);
    return li;
}

async function carregarFeed() {
    let publicacoes = [];

    try {
        publicacoes = await listarPublicacoes();
    } catch (erro) {
        console.error("Não foi possível carregar o feed da comunidade:", erro);
    }

    elFeedList.innerHTML = "";

    if (publicacoes.length === 0) {
        elFeedEmpty.style.display = "flex";
        return;
    }

    elFeedEmpty.style.display = "none";

    for (const publicacao of publicacoes) {
        elFeedList.appendChild(await criarItemFeed(publicacao));
    }
}

//função para a seçao de realizar a publicação
async function publicar() {
    elPubErro.textContent = "";

    const texto = elPubTexto.value.trim();
    if (!texto) {
        elPubErro.textContent = "Escreva algo antes de publicar.";
        return;
    }

    if (!usuarioAtual) {
        elPubErro.textContent = "Você precisa estar logado para publicar.";
        return;
    }

    elBtnPublicar.disabled = true;

    try {
        await criarPublicacao({
            userId: usuarioAtual.$id,
            text: texto,
            link: elPubLink.value.trim(),
        });

        elPubTexto.value = "";
        elPubLink.value = "";

        await carregarFeed();

    } catch (erro) {
        elPubErro.textContent = erro?.message || "Não foi possível publicar. Tente novamente.";
    } finally {
        elBtnPublicar.disabled = false;
    }
}

elBtnPublicar.addEventListener("click", publicar);

elBtnNovaPub.addEventListener("click", () => {
    elPubTexto.scrollIntoView({ behavior: "smooth", block: "center" });
    elPubTexto.focus();
});

(async function iniciar() {
    usuarioAtual = await pegarUsuarioAtual();
    await carregarFeed();
})();
