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
                "A Inteligência Artificial (IA) é um programa de computador feito para imitar algumas capacidades da mente humana, como aprender, reconhecer padrões e tomar decisões.",
                "Ela consegue fazer coisas que antes só uma pessoa fazia: escrever textos, criar imagens, responder perguntas e até conversar como se fosse gente.",
                "A IA já está em muitos lugares do seu dia a dia, mesmo sem você perceber: nos filtros que separam spam do seu e-mail, nas recomendações de vídeos e músicas, nos tradutores automáticos e nos assistentes de voz do celular.",
                "Existem tipos diferentes de IA. A mais comum hoje é feita para uma tarefa específica, como reconhecer um rosto numa foto ou traduzir um texto. Ela não pensa como um ser humano, só segue padrões que aprendeu a partir de muitos exemplos.",
                "A IA não existe para substituir as pessoas, e sim para ajudar: economizar tempo, automatizar tarefas repetitivas e apoiar áreas como educação, saúde e trabalho.",
                "Entender como a IA funciona é o primeiro passo para usá-la a seu favor, sem cair em armadilhas. Nas próximas trilhas, você vai aprender a identificar, usar e se proteger dos riscos dessa tecnologia."
            ],
        },
        desafios: [
            {
                id: "oqi-d1",
                tipo: "alternativa",
                pergunta: "O que significa a sigla IA?",
                opcoes: [
                    { id: "a", texto: "Inteligência Automática" },
                    { id: "b", texto: "Inteligência Artificial", correta: true },
                    { id: "c", texto: "Inteligência Aplicada" },
                ],
            },
            {
                id: "oqi-d2",
                tipo: "alternativa",
                pergunta: "Para que a Inteligência Artificial foi criada?",
                opcoes: [
                    { id: "a", texto: "Para substituir totalmente as pessoas no trabalho" },
                    { id: "b", texto: "Para ajudar as pessoas, economizando tempo e automatizando tarefas", correta: true },
                    { id: "c", texto: "Para funcionar sozinha, sem nenhum controle humano" },
                ],
            },
            {
                id: "oqi-d3",
                tipo: "alternativa",
                pergunta: "Qual das opções abaixo é um exemplo de IA no seu dia a dia?",
                opcoes: [
                    { id: "a", texto: "Uma calculadora comum" },
                    { id: "b", texto: "Um filtro de spam no seu e-mail", correta: true },
                    { id: "c", texto: "Uma lista de compras escrita à mão" },
                ],
            },
            {
                id: "oqi-d4",
                tipo: "imagem",
                pergunta: "Qual imagem foi criada por IA?",
                textoComplementar: "Dica: observe os detalhes das mãos e do texto na imagem.",
                opcoes: [
                    { id: "b", src: "../../assets/imagens/oqi-maos-ia.png", label: "Imagem B", correta: true },
                    { id: "a", src: "../../assets/imagens/oqi-maos-real.jpg", label: "Imagem A" },

                ],
            },
            {
                id: "oqi-d5",
                tipo: "imagem",
                pergunta: "E entre essas duas, qual foi criada por IA?",
                textoComplementar: "Dica: repare na simetria dos olhos e dos dentes.",
                opcoes: [
                    { id: "a", src: "../../assets/imagens/oqi-rosto-real.jpg", label: "Imagem A" },
                    { id: "b", src: "../../assets/imagens/oqi-rosto-ia.png", label: "Imagem B", correta: true },
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
            tempoLeitura: 5,
            atualizadoEm: "2 de julho de 2026",
            paragrafos: [
                "A cada dia fica mais difícil perceber a diferença entre o que é real e o que foi criado por IA. Mas existem sinais que ajudam a desconfiar.",
                "Perfeição exagerada: imagens com pele lisa demais, sem nenhuma imperfeição, ou dentes perfeitamente alinhados até as bordas. Na vida real, ninguém é tão simétrico assim.",
                "Mãos e detalhes estranhos: fotos feitas por IA costumam mostrar pessoas com dedos a mais, dedos a menos, ou mãos borradas e tortas. Esse ainda é um dos maiores erros da tecnologia.",
                "Fundo confuso: repare no que está atrás da pessoa ou objeto principal da imagem. A IA às vezes cria objetos sem sentido, textos ilegíveis em placas, ou padrões que se repetem de forma estranha.",
                "Erros bobos no texto: frases que repetem a mesma palavra várias vezes sem necessidade, ou que mudam de assunto do nada, são sinais de que ninguém revisou aquele conteúdo com atenção.",
                "Falta de emoção: textos \"certinhos\" demais, que parecem um manual de instruções frio, sem naturalidade, costumam ser escritos por IA sem nenhum ajuste humano.",
                "Verifique a fonte: antes de acreditar ou compartilhar algo, veja quem publicou. Sites de notícias conhecidos e confiáveis são sempre mais seguros do que uma imagem ou texto solto que chegou pelo WhatsApp.",
                "Ficar atento a esses sinais ajuda a não cair em golpes, não acreditar em fake news e não espalhar informação falsa sem perceber."
            ],
        },
        desafios: [
            {
                id: "cid-d1",
                tipo: "alternativa",
                pergunta: "Antes de acreditar em uma notícia que chegou pelo WhatsApp, o que você deve fazer?",
                opcoes: [
                    { id: "a", texto: "Compartilhar rápido, antes que outras pessoas vejam" },
                    { id: "b", texto: "Verificar se a informação também aparece em um site de notícias confiável", correta: true },
                    { id: "c", texto: "Acreditar, porque veio de um grupo de família" },
                ],
            },
            {
                id: "cid-d2",
                tipo: "alternativa",
                pergunta: "Um texto que repete a mesma palavra várias vezes sem necessidade pode ser sinal de quê?",
                opcoes: [
                    { id: "a", texto: "Que foi escrito com muito capricho" },
                    { id: "b", texto: "Que foi gerado por IA sem revisão", correta: true },
                    { id: "c", texto: "Que é, com certeza, uma informação verdadeira" },
                ],
            },
            {
                id: "cid-d3",
                tipo: "alternativa",
                pergunta: "Que tipo de imagem deve deixar você desconfiado?",
                opcoes: [
                    { id: "a", texto: "Uma foto com iluminação natural" },
                    { id: "b", texto: "Uma foto com pele lisa demais e dentes perfeitos até as bordas", correta: true },
                    { id: "c", texto: "Uma foto tirada em um dia nublado" },
                ],
            },
            {
                id: "cid-d4",
                tipo: "imagem",
                pergunta: "Qual dessas duas imagens foi criada por IA?",
                textoComplementar: "Dica: repare nas mãos e nos dedos das pessoas.",
                opcoes: [
                    { id: "b", src: "../../assets/imagens/cid-maos-ia.png", label: "Imagem B", correta: true },

                    { id: "a", src: "../../assets/imagens/cid-maos-real.jpg", label: "Imagem A" },
                ],
            },
            {
                id: "cid-d5",
                tipo: "imagem",
                pergunta: "E entre essas duas, qual foi criada por IA?",
                textoComplementar: "Dica: observe o fundo da imagem e qualquer texto ou placa que apareça.",
                opcoes: [
                    { id: "b", src: "../../assets/imagens/cid-rua-ia.png", label: "Imagem B", correta: true },
                    { id: "a", src: "../../assets/imagens/cid-rua-real.jpg", label: "Imagem A" },

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
            paragrafos: [
                "Usar a Inteligência Artificial é mais simples do que parece. É como conversar com um amigo pelo celular: você só precisa dar uma ordem clara.",
                "Escolha um aplicativo: existem vários aplicativos de conversa com IA, muitos deles gratuitos. Baixe um no seu celular para começar.",
                "Escreva uma ordem: digite o que você precisa no campo de mensagem, como se estivesse pedindo um favor para uma pessoa. Por exemplo: \"me ajude a escrever uma mensagem de aniversário para minha mãe\".",
                "Seja bem específico: quanto mais detalhes você der, melhor será a resposta. Em vez de pedir só \"uma receita\", peça \"uma receita de bolo de caneca de chocolate, que fica pronta em 5 minutos\".",
                "Peça correções: se a resposta não ficou boa, não desista. Diga o que faltou e peça para a IA tentar de novo. Ela não se ofende e pode refazer quantas vezes for preciso, até ficar do jeito que você precisa.",
                "Use para tarefas do dia a dia: escrever uma mensagem, montar uma lista de compras, organizar seus horários, tirar uma dúvida rápida ou até praticar uma conversa em outro idioma.",
                "Aprender a pedir bem para a IA é uma habilidade útil — quanto mais você pratica, mais rápido e melhor fica o resultado."
            ],
        },
        desafios: [
            {
                id: "cu-d1",
                tipo: "alternativa",
                pergunta: "Qual é a melhor forma de pedir algo para uma IA?",
                opcoes: [
                    { id: "a", texto: "De forma vaga, deixando a IA adivinhar o que você quer" },
                    { id: "b", texto: "De forma clara e específica, com detalhes do que você precisa", correta: true },
                    { id: "c", texto: "Só uma vez, sem poder pedir para corrigir depois" },
                ],
            },
            {
                id: "cu-d2",
                tipo: "alternativa",
                pergunta: "Se a resposta da IA não ficou boa, o que você pode fazer?",
                opcoes: [
                    { id: "a", texto: "Nada, a resposta não pode ser mudada" },
                    { id: "b", texto: "Dizer o que faltou e pedir para ela refazer", correta: true },
                    { id: "c", texto: "Desinstalar o aplicativo imediatamente" },
                ],
            },
            {
                id: "cu-d3",
                tipo: "alternativa",
                pergunta: "Qual desses pedidos tem mais chance de dar uma boa resposta?",
                opcoes: [
                    { id: "a", texto: "\"Me dê uma receita\"" },
                    { id: "b", texto: "\"Me dê uma receita de bolo de caneca de chocolate, pronta em 5 minutos\"", correta: true },
                    { id: "c", texto: "\"Faça alguma coisa boa\"" },
                ],
            },
            {
                id: "cu-d4",
                tipo: "imagem",
                pergunta: "A IA também consegue criar imagens a partir de um pedido. Qual dessas foi gerada por IA?",
                textoComplementar: "Dica: repare em elementos repetidos ou fora do lugar no fundo.",
                opcoes: [
                    { id: "a", src: "../../assets/imagens/cu-paisagem-real.avif", label: "Imagem A" },
                    { id: "b", src: "../../assets/imagens/cu-paisagem-ia.png", label: "Imagem B", correta: true },
                ],
            },
            {
                id: "cu-d5",
                tipo: "imagem",
                pergunta: "E entre essas duas, qual foi gerada por IA?",
                textoComplementar: "Dica: observe as mãos e os dedos da pessoa na imagem.",
                opcoes: [
                    { id: "a", src: "../../assets/imagens/cu-retrato-real.jpg", label: "Imagem A" },
                    { id: "b", src: "../../assets/imagens/cu-retrato-ia.png", label: "Imagem B", correta: true },

                ],
            },
        ],
    },
    {
        id: "cuidados-com-ia",
        titulo: "Cuidados com a IA",
        bloqueada: false,
        leitura: {
            titulo: "Cuidados ao usar IA",
            tempoLeitura: 6,
            atualizadoEm: "5 de julho de 2026",
            paragrafos: [
                "A Inteligência Artificial ajuda muito, mas ela também erra bastante. Por isso, é importante não acreditar em tudo que ela diz, e usar sempre o bom senso.",
                "Evite mentiras: a IA inventa fatos com facilidade, mesmo parecendo segura do que está dizendo. Sempre confira as informações importantes em sites de notícias confiáveis antes de repassar para outras pessoas.",
                "Proteja seus dados: nunca digite seu CPF, senhas ou dados do banco em uma conversa com IA. Esses dados podem ser armazenados ou usados de forma indevida.",
                "Cuidado com golpes: criminosos já usam a IA para clonar a voz de parentes e pedir dinheiro por telefone. Se receber uma ligação assim, desconfie e tente confirmar com a pessoa por outro meio antes de agir.",
                "Não mude remédios: nunca use a IA para descobrir doenças ou alterar a dose de um remédio. Ela pode errar, e sua saúde não pode depender de um palpite. Procure sempre um médico de verdade.",
                "Desconfie de imagens e vídeos chocantes demais: se algo parecer bom demais ou absurdo demais para ser verdade, pode ter sido criado por IA para te enganar ou te deixar com raiva.",
                "Ensine outras pessoas: compartilhe esses cuidados com familiares, principalmente pessoas mais velhas, que costumam ser mais visadas por golpes usando IA."
            ],
        },
        desafios: [
            {
                id: "cui-d1",
                tipo: "alternativa",
                pergunta: "O que você NUNCA deve fazer numa conversa com IA?",
                opcoes: [
                    { id: "a", texto: "Pedir uma receita de bolo" },
                    { id: "b", texto: "Digitar seu CPF, senhas ou dados do banco", correta: true },
                    { id: "c", texto: "Pedir para ela corrigir uma resposta" },
                ],
            },
            {
                id: "cui-d2",
                tipo: "alternativa",
                pergunta: "Você recebe uma ligação de um número desconhecido com a voz idêntica de um parente, pedindo dinheiro urgente. O que fazer?",
                opcoes: [
                    { id: "a", texto: "Transferir o dinheiro imediatamente, já que é a voz da pessoa" },
                    { id: "b", texto: "Desconfiar e tentar confirmar com a pessoa por outro meio antes de agir", correta: true },
                    { id: "c", texto: "Ignorar e nunca mais atender ligações" },
                ],
            },
            {
                id: "cui-d3",
                tipo: "alternativa",
                pergunta: "É seguro usar uma IA para decidir a dose de um remédio?",
                opcoes: [
                    { id: "a", texto: "Sim, ela sempre acerta sobre saúde" },
                    { id: "b", texto: "Não, decisões de saúde devem ser sempre confirmadas com um médico", correta: true },
                    { id: "c", texto: "Sim, mas só remédios naturais" },
                ],
            },
            {
                id: "cui-d4",
                tipo: "imagem",
                pergunta: "Golpistas podem criar imagens falsas de situações que nunca aconteceram. Qual dessas é real?",
                textoComplementar: "Dica: observe se a cena faz sentido como um todo, incluindo o fundo.",
                opcoes: [
                    { id: "b", src: "../../assets/imagens/cui-situacao-ia.png", label: "Imagem B" },
                    { id: "a", src: "../../assets/imagens/cui-situacao-real.avif", label: "Imagem A", correta: true },
                ],
            },
            {
                id: "cui-d5",
                tipo: "imagem",
                pergunta: "Qual desses dois documentos parece ter sido manipulado por IA?",
                textoComplementar: "Dica: repare em letras borradas, símbolos estranhos ou textos sem sentido.",
                opcoes: [
                    { id: "a", src: "../../assets/imagens/cui-documento-real.jpg", label: "Imagem A" },
                    { id: "b", src: "../../assets/imagens/cui-documento-ia.png", label: "Imagem B", correta: true },
                ],
            },
        ],
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