
import {
    pegarUsuarioAtual,
    pegarPerfil,
    listarNoticias,
    criarNoticia,
} from "../../services/appwrite.js";

const PAGINA_TAMANHO = 5;

// Rótulo visível + classe CSS de cada categoria (a classe "analise", sem
// hífen, já existe no CSS original — mantida assim por compatibilidade).
const CATEGORIAS = {
    verdadeira: { label: "Verdadeira", classe: "verdadeira" },
    falsa: { label: "Falsa", classe: "falsa" },
    "em-analise": { label: "Em análise", classe: "analise" },
};

const elBusca = document.getElementById("busca-input");
const elFiltrosLista = document.getElementById("filtros-lista");
const elLista = document.getElementById("noticias-lista");
const elPaginaAnterior = document.getElementById("pagina-anterior");
const elPaginaProxima = document.getElementById("pagina-proxima");
const elPaginaInfo = document.getElementById("pagina-info");
const elBtnNovaNoticia = document.getElementById("btn-nova-noticia");
const elFormWrapper = document.getElementById("form-nova-noticia");
const elForm = document.getElementById("noticia-form");
const elNoticiaErro = document.getElementById("noticia-erro");

let todasAsNoticias = [];
let usuarioAtual = null;

let categoriaAtiva = "todas";
let termoBusca = "";
let paginaAtual = 1;

// RENDERIZAÇÃO

function formatarData(valor) {
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function criarCard(noticia) {
    const info = CATEGORIAS[noticia.categoria] || { label: noticia.categoria, classe: "" };

    const artigo = document.createElement("article");
    artigo.className = `card ${info.classe}`;

    const conteudo = document.createElement("div");
    conteudo.className = "card-conteudo";

    const titulo = document.createElement("h2");
    titulo.textContent = info.label;

    const texto = document.createElement("p");
    texto.textContent = noticia.texto;

    const tempo = document.createElement("time");
    tempo.dateTime = noticia.data;
    tempo.textContent = formatarData(noticia.data);

    conteudo.append(titulo, texto, tempo);

    if (noticia.link) {
        const link = document.createElement("a");
        link.href = noticia.link;
        link.className = "btn-ler-mais";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ler mais";
        conteudo.appendChild(link);
    }

    const imagemWrap = document.createElement("div");
    imagemWrap.className = "card-imagem";
    const img = document.createElement("img");
    img.src = noticia.imagem;
    img.alt = "";
    img.loading = "lazy";
    imagemWrap.appendChild(img);

    artigo.append(conteudo, imagemWrap);
    return artigo;
}

function noticiasFiltradas() {
    const busca = termoBusca.trim().toLowerCase();

    return todasAsNoticias.filter((n) => {
        const bateCategoria = categoriaAtiva === "todas" || n.categoria === categoriaAtiva;
        if (!bateCategoria) return false;

        if (!busca) return true;

        const label = (CATEGORIAS[n.categoria]?.label || "").toLowerCase();
        return n.texto.toLowerCase().includes(busca) || label.includes(busca);
    });
}

function renderizar() {
    const filtradas = noticiasFiltradas();
    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGINA_TAMANHO));

    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    const inicio = (paginaAtual - 1) * PAGINA_TAMANHO;
    const pagina = filtradas.slice(inicio, inicio + PAGINA_TAMANHO);

    elLista.innerHTML = "";

    if (pagina.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "noticias-vazio";
        vazio.textContent = "Nenhuma notícia encontrada.";
        elLista.appendChild(vazio);
    } else {
        pagina.forEach((noticia) => elLista.appendChild(criarCard(noticia)));
    }

    elPaginaInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    elPaginaAnterior.setAttribute("aria-disabled", String(paginaAtual <= 1));
    elPaginaProxima.setAttribute("aria-disabled", String(paginaAtual >= totalPaginas));
}

// FILTROS, BUSCA E PAGINAÇÃO

elFiltrosLista.addEventListener("click", (evento) => {
    const link = evento.target.closest("a[data-categoria]");
    if (!link) return;

    evento.preventDefault();

    elFiltrosLista.querySelectorAll("a").forEach((a) => a.classList.remove("ativo"));
    link.classList.add("ativo");

    categoriaAtiva = link.dataset.categoria;
    paginaAtual = 1;
    renderizar();
});

elBusca.addEventListener("input", () => {
    termoBusca = elBusca.value;
    paginaAtual = 1;
    renderizar();
});

elPaginaAnterior.addEventListener("click", (evento) => {
    evento.preventDefault();
    if (paginaAtual <= 1) return;
    paginaAtual -= 1;
    renderizar();
});

elPaginaProxima.addEventListener("click", (evento) => {
    evento.preventDefault();
    const totalPaginas = Math.max(1, Math.ceil(noticiasFiltradas().length / PAGINA_TAMANHO));
    if (paginaAtual >= totalPaginas) return;
    paginaAtual += 1;
    renderizar();
});

// NOVA NOTÍCIA (só moderadores)

elBtnNovaNoticia.addEventListener("click", () => {
    const abrindo = elFormWrapper.hidden;
    elFormWrapper.hidden = !abrindo;
    if (abrindo) elForm.querySelector("select, textarea, input").focus();
});

document.getElementById("noticia-cancelar").addEventListener("click", () => {
    elForm.reset();
    elNoticiaErro.textContent = "";
    elFormWrapper.hidden = true;
});

elForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    elNoticiaErro.textContent = "";

    if (!usuarioAtual) {
        elNoticiaErro.textContent = "Você precisa estar logado para publicar.";
        return;
    }

    const botao = document.getElementById("noticia-publicar");
    botao.disabled = true;

    try {
        await criarNoticia({
            categoria: document.getElementById("noticia-categoria").value,
            texto: document.getElementById("noticia-texto").value.trim(),
            imagem: document.getElementById("noticia-imagem").value.trim(),
            link: document.getElementById("noticia-link").value.trim(),
            data: new Date().toISOString(),
            autorId: usuarioAtual.$id,
        });

        elForm.reset();
        elFormWrapper.hidden = true;

        todasAsNoticias = await listarNoticias();
        paginaAtual = 1;
        renderizar();

    } catch (erro) {
        elNoticiaErro.textContent = erro?.message || "Não foi possível publicar a notícia.";
    } finally {
        botao.disabled = false;
    }
});

// INICIALIZAÇÃO

// Confere se o usuário logado é moderador (mostra o botão "Nova notícia")
async function verificarModerador() {
    usuarioAtual = await pegarUsuarioAtual();
    if (!usuarioAtual) return;

    try {
        const perfil = await pegarPerfil(usuarioAtual.$id);
        if (perfil?.isModerator) {
            elBtnNovaNoticia.hidden = false;
        }
    } catch (erro) {
        console.error("Não foi possível verificar o perfil do usuário:", erro);
    }
}

async function carregarNoticias() {
    try {
        todasAsNoticias = await listarNoticias();
    } catch (erro) {
        console.error("Não foi possível carregar as notícias:", erro);
        todasAsNoticias = [];
    }
}

// A tela fica só com o carregamento (sem sidebar) até as duas buscas acima
// terminarem — elas não dependem uma da outra, então rodam em paralelo
// em vez de uma esperar a outra terminar.
(async function iniciar() {
    const elCarregando = document.getElementById("carregando-pagina");
    const elConteudo = document.getElementById("conteudo-noticias");

    await Promise.all([verificarModerador(), carregarNoticias()]);

    renderizar();

    elCarregando.hidden = true;
    elConteudo.hidden = false;
})();
