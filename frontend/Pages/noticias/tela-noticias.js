
import {
    pegarUsuarioAtual,
    pegarPerfil,
    listarNoticias,
    criarNoticia,
    atualizarNoticia,
    excluirNoticia,
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
const elFormTitulo = document.getElementById("noticia-form-titulo");
const elFormPublicar = document.getElementById("noticia-publicar");
const elNoticiaErro = document.getElementById("noticia-erro");

let todasAsNoticias = [];
let usuarioAtual = null;
let souModerador = false;

// Guarda o id da notícia em edição — null quando o formulário está
// sendo usado pra criar uma notícia nova.
let editandoId = null;

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

    // Imagem no topo, com o selo da categoria sobreposto no canto
    const imagemWrap = document.createElement("div");
    imagemWrap.className = "card-imagem";

    const img = document.createElement("img");
    img.src = noticia.imagem;
    img.alt = "";
    img.loading = "lazy";

    const selo = document.createElement("span");
    selo.className = `card-selo card-selo--${info.classe}`;
    selo.textContent = info.label;

    imagemWrap.append(img, selo);

    // Texto da notícia como conteúdo principal do card
    const conteudo = document.createElement("div");
    conteudo.className = "card-conteudo";

    const texto = document.createElement("p");
    texto.className = "card-texto";
    texto.textContent = noticia.texto;

    conteudo.appendChild(texto);

    // Rodapé fixo embaixo: data à esquerda, "Ler mais" à direita
    const rodape = document.createElement("div");
    rodape.className = "card-rodape";

    const tempo = document.createElement("time");
    tempo.dateTime = noticia.data;
    tempo.textContent = formatarData(noticia.data);
    rodape.appendChild(tempo);

    if (noticia.link) {
        const link = document.createElement("a");
        link.href = noticia.link;
        link.className = "btn-ler-mais";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ler mais";
        rodape.appendChild(link);
    }

    conteudo.appendChild(rodape);

    // Editar/excluir só aparece pra quem criou a notícia — é a mesma
    // regra das permissões da tabela (só o autor tem update/delete).
    if (souModerador && usuarioAtual && noticia.autorId === usuarioAtual.$id) {
        const acoes = document.createElement("div");
        acoes.className = "card-acoes-moderador";

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "card-btn-editar";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => abrirEdicao(noticia));

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "card-btn-excluir";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => excluirComConfirmacao(noticia));

        acoes.append(btnEditar, btnExcluir);
        conteudo.appendChild(acoes);
    }

    artigo.append(imagemWrap, conteudo);
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

// NOVA NOTÍCIA / EDITAR NOTÍCIA (só moderadores)

function fecharFormulario() {
    elForm.reset();
    elNoticiaErro.textContent = "";
    elFormWrapper.hidden = true;
    editandoId = null;
    elFormTitulo.textContent = "Nova notícia";
    elFormPublicar.textContent = "Publicar";
}

elBtnNovaNoticia.addEventListener("click", () => {
    const abrindo = elFormWrapper.hidden;

    // Se estava editando uma notícia e o usuário clica em "Nova notícia",
    // volta o formulário pro modo de criação em vez de continuar editando.
    if (abrindo) editandoId = null;

    elFormTitulo.textContent = "Nova notícia";
    elFormPublicar.textContent = "Publicar";
    elFormWrapper.hidden = !abrindo;
    if (abrindo) {
        elForm.reset();
        elForm.querySelector("select, textarea, input").focus();
    }
});

// Preenche o formulário com os dados da notícia clicada e troca pro
// modo de edição (reaproveita o mesmo formulário de "Nova notícia").
function abrirEdicao(noticia) {
    editandoId = noticia.$id;

    document.getElementById("noticia-categoria").value = noticia.categoria;
    document.getElementById("noticia-texto").value = noticia.texto;
    document.getElementById("noticia-imagem").value = noticia.imagem;
    document.getElementById("noticia-link").value = noticia.link || "";

    elNoticiaErro.textContent = "";
    elFormTitulo.textContent = "Editar notícia";
    elFormPublicar.textContent = "Salvar alterações";
    elFormWrapper.hidden = false;
    elFormWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function excluirComConfirmacao(noticia) {
    const confirmou = window.confirm("Excluir esta notícia? Essa ação não pode ser desfeita.");
    if (!confirmou) return;

    try {
        await excluirNoticia(noticia.$id);
        todasAsNoticias = todasAsNoticias.filter((n) => n.$id !== noticia.$id);
        renderizar();
    } catch (erro) {
        window.alert(erro?.message || "Não foi possível excluir a notícia.");
    }
}

document.getElementById("noticia-cancelar").addEventListener("click", () => {
    fecharFormulario();
});

elForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    elNoticiaErro.textContent = "";

    if (!usuarioAtual) {
        elNoticiaErro.textContent = "Você precisa estar logado para publicar.";
        return;
    }

    elFormPublicar.disabled = true;

    const dados = {
        categoria: document.getElementById("noticia-categoria").value,
        texto: document.getElementById("noticia-texto").value.trim(),
        imagem: document.getElementById("noticia-imagem").value.trim(),
        link: document.getElementById("noticia-link").value.trim(),
    };

    try {
        if (editandoId) {
            await atualizarNoticia(editandoId, dados);
        } else {
            await criarNoticia({
                ...dados,
                data: new Date().toISOString(),
                autorId: usuarioAtual.$id,
            });
        }

        fecharFormulario();

        todasAsNoticias = await listarNoticias();
        paginaAtual = 1;
        renderizar();

    } catch (erro) {
        elNoticiaErro.textContent = erro?.message || "Não foi possível salvar a notícia.";
    } finally {
        elFormPublicar.disabled = false;
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
            souModerador = true;
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

// A tela fica só com o carregamento até as duas buscas acima
// terminarem
(async function iniciar() {
    const elCarregando = document.getElementById("carregando-pagina");
    const elConteudo = document.getElementById("conteudo-noticias");

    await Promise.all([verificarModerador(), carregarNoticias()]);

    renderizar();

    elCarregando.hidden = true;
    elConteudo.hidden = false;
})();
