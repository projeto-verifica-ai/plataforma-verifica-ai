/* ============================================================
   GUIA-RAPIDO.JS — Verifica AI
   Script específico da página "Guia Rápido".
   Guarda os dados de TODAS as trilhas (mock, por enquanto) e
   controla a troca de conteúdo quando o usuário clica numa
   trilha desbloqueada na barra de tabs.

   Quando o Appwrite estiver pronto, o array `trilhas` abaixo vira
   o retorno de uma chamada como `buscarTrilhas()` — o resto do
   arquivo (renderizarTrilha, o listener de clique) continua igual.
   ============================================================ */

// Lista de todas as trilhas do Guia Rápido.
// `bloqueada: true` esconde o conteúdo até o usuário desbloquear
// (por enquanto isso é fixo aqui; depois vai depender do progresso salvo no Appwrite).
const trilhas = [
    {
        id: "o-que-e-ia",
        titulo: "O que é IA?",
        bloqueada: false,
        leitura: {
            titulo: "O que é Inteligência Artificial?",
            tempoLeitura: 6,
            atualizadoEm: "30 de junho de 2026",
            paragrafos: [
                "A Inteligência Artificial (IA) é uma área da ciência da computação que cria sistemas capazes de realizar tarefas que, normalmente, exigiriam inteligência humana. Isso inclui aprender com experiências, reconhecer padrões, tomar decisões e até mesmo gerar conteúdos.",
                "A IA está presente em muitas ferramentas e serviços que usamos todos os dias — desde assistentes virtuais, recomendações de filmes, até filtros de e-mail e tradutores automáticos.",
                "Existem diferentes tipos de IA, como a IA estreita (que realiza tarefas específicas, como reconhecimento facial) e a IA geral (capaz de entender e aprender qualquer tarefa, como um ser humano). Atualmente, usamos principalmente a IA estreita.",
                "O objetivo da IA não é substituir pessoas, mas sim aumentar nossas capacidades, automatizar tarefas repetitivas e gerar novas possibilidades em diversas áreas, como educação, saúde, negócios, entretenimento e muito mais.",
                "Compreender como a IA funciona é o primeiro passo para utilizá-la de forma consciente, ética e segura. Ao longo deste guia, você vai aprender a identificar, usar e se proteger dos riscos relacionados a essa tecnologia incrível."
            ],
        },
        desafios: [
            {
                id: "oqi-d1",
                tipo: "alternativa",
                pergunta: "O que significa IA?",
                texto: "Dica: observe os detalhes das mãos e do texto na imagem.",
                opcoes: [
                    { id: "a", texto: "Inteligência Automática" },
                    { id: "b", texto: "Inteligência Artificial", correta: true },
                    { id: "c", texto: "Inteligência Aplicada" },
                ],
            },
            {
                id: "oqi-d2",
                tipo: "imagem",
                pergunta: "Qual imagem foi criada por IA?",
                textoComplementar: "Dica: observe os detalhes das mãos e do texto na imagem.",
                opcoes: [
                    { id: "a", src: "../../assets/imagens/imagem-a.jpg", label: "Imagem real" },
                    { id: "b", src: "../../assets/imagens/imagem-b.jpg", label: "Imagem de IA", correta: true },
                ],
            },
        ],
    },
    {
        id: "como-identificar",
        titulo: "Como identificar a IA",
        bloqueada: false,
        leitura: {
            titulo: "Como identificar conteúdo gerado por IA",
            tempoLeitura: 4,
            atualizadoEm: "2 de julho de 2026",
            paragrafos: [
                "Conteúdos gerados por IA costumam ter padrões específicos: texturas repetitivas, detalhes inconsistentes em imagens, ou um tom de escrita genérico demais em textos.",
            ],
        },
        desafios: [
            {
                id: "cid-d1",
                tipo: "alternativa",
                pergunta: "Qual é um sinal comum de imagem gerada por IA?",
                opcoes: [
                    { id: "a", texto: "Cores muito vivas" },
                    { id: "b", texto: "Detalhes inconsistentes, como mãos ou texto distorcido", correta: true },
                    { id: "c", texto: "Resolução muito alta" },
                ],
            },
        ],
    },
    {
        id: "como-usar",
        titulo: "Como usar IA",
        bloqueada: false,
        leitura: {
            titulo: "Como usar IA no dia a dia",
            tempoLeitura: 5,
            atualizadoEm: "5 de julho de 2026",
            paragrafos: ["Conteúdo desta trilha ainda será liberado."],
        },
        desafios: [],
    },
    {
        id: "cuidados-com-ia",
        titulo: "Cuidados com a IA",
        bloqueada: true,
        leitura: {
            titulo: "Cuidados ao usar IA",
            tempoLeitura: 5,
            atualizadoEm: "5 de julho de 2026",
            paragrafos: ["Conteúdo desta trilha ainda será liberado."],
        },
        desafios: [],
    },
];

// Referências aos elementos fixos da página (tabs + containers vazios)
const elTabs = document.getElementById("trilha-tabs");
const elArtigoContainer = document.getElementById("artigo-container");
const elDesafiosContainer = document.getElementById("desafios-container");

// Troca todo o conteúdo da tela pra exibir a trilha recebida por parâmetro.
// Em vez de reaproveitar os elementos antigos, apaga tudo e cria elementos
// novos — isso garante que nenhum estado da trilha anterior (ex: desafio
// já respondido) "vaze" pra trilha nova.
function renderizarTrilha(trilhaId) {
    const trilha = trilhas.find((t) => t.id === trilhaId);
    if (!trilha) return;

    // Recria o bloco de leitura (artigo) do zero
    elArtigoContainer.innerHTML = "";
    const artigo = document.createElement("verifica-artigo");
    artigo.setAttribute("id", `artigo-${trilha.id}`);
    artigo.setAttribute("titulo", trilha.leitura.titulo);
    artigo.setAttribute("tempo-leitura", trilha.leitura.tempoLeitura);
    artigo.setAttribute("atualizado-em", trilha.leitura.atualizadoEm);
    elArtigoContainer.appendChild(artigo);
    artigo.paragrafos = trilha.leitura.paragrafos; // dispara o render do componente

    // Recria os desafios do zero — a quantidade varia por trilha (0 a 3 no mock)
    elDesafiosContainer.innerHTML = "";
    trilha.desafios.forEach((desafio) => {
        const elemento = document.createElement("verifica-desafio");
        elemento.setAttribute("id", desafio.id);
        elemento.setAttribute("tipo", desafio.tipo);
        elemento.setAttribute("pergunta", desafio.pergunta);
        elemento.setAttribute("textoComplementar", desafio.textoComplementar);

        elDesafiosContainer.appendChild(elemento);
        elemento.opcoes = desafio.opcoes; // dispara o render do componente
    });

    // Atualiza a barra de tabs pra destacar a trilha que acabou de ser exibida
    elTabs.ativa = trilha.id;
}

// Envia pro componente de tabs só o que ele precisa saber (id, titulo, bloqueada) —
// não precisa saber o conteúdo da trilha, só de exibir a lista e o estado de cada uma.
elTabs.trilhas = trilhas.map(({ id, titulo, bloqueada }) => ({ id, titulo, bloqueada }));

// Ouve o evento emitido pelo componente de tabs quando o usuário clica
// numa trilha desbloqueada, e troca o conteúdo da tela.
document.addEventListener("trilha-selecionada", (evento) => {
    renderizarTrilha(evento.detail.trilhaId);
});

// Ao carregar a página, mostra a primeira trilha desbloqueada encontrada.
renderizarTrilha(trilhas.find((t) => !t.bloqueada).id);