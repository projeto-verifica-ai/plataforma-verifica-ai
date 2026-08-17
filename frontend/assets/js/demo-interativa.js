(function () {
    const situacoes = [
        {
            id: "pix",
            rotulo: "Taxa no Pix",
            mensagem:
                "URGENTE! O governo vai começar a cobrar uma taxa para usar o PIX a partir do próximo mês. Compartilhe!",
            classificacao: "falso",
            explicacao:
                "Boato recorrente. O Banco Central já esclareceu que não existe cobrança geral para pessoas físicas.",
            sinais: [
                "Mensagem alarmista",
                "Pedido urgente para compartilhar",
                "Falta de fonte confiável",
            ],
        },
        {
            id: "covid",
            rotulo: "Máscara em aeroportos",
            mensagem:
                "O Brasil passou a exigir o uso de máscara em aeroportos e aeronaves durante a pandemia de COVID-19.",
            classificacao: "verdadeiro",
            explicacao:
                "Informação verdadeira dentro do contexto sanitário da época. Regras como essa foram implementadas por autoridades.",
            sinais: [
                "Possui contexto histórico",
                "Verificável em fontes oficiais",
                "A data da informação importa",
            ],
        },
        {
            id: "whatsapp",
            rotulo: "Ligação no WhatsApp",
            mensagem:
                "URGENTE: Novo golpe do WhatsApp permite que criminosos roubem sua conta apenas por você atender uma ligação!",
            classificacao: "enganoso",
            explicacao:
                "Atender ligação não rouba o WhatsApp. Golpes exigem que você passe um código ou clique em links maliciosos. A mensagem exagera o risco real.",
            sinais: [
                "Exagero na ameaça",
                "Pedido de repasse em massa",
                "Mistura risco real com método falso",
            ],
        },
        {
            id: "papa",
            rotulo: "Jaqueta do Papa",
            mensagem:
                "Vídeo mostra o Papa usando uma jaqueta branca de luxo. A imagem prova que ele aderiu à moda.",
            classificacao: "falso",
            explicacao:
                "A imagem viral foi gerada por inteligência artificial e não é real.",
            sinais: [
                "Imagem super realista, mas com contexto improvável",
                "Mãos ou texturas distorcidas",
            ],
        },
        {
            id: "deepfake",
            rotulo: "Vídeos feitos por IA",
            mensagem:
                "Ferramentas de IA podem criar imagens, vídeos e áudios super realistas de pessoas dizendo coisas que nunca fizeram.",
            classificacao: "verdadeiro",
            explicacao:
                "Tecnologicamente possível (deepfakes). Por isso a necessidade de analisar criticamente o que vemos.",
            sinais: ["Tecnologia existente e comprovada mundialmente"],
        },
    ];

    const CLASSIFICACOES = {
        falso: { rotulo: "Falso", icone: "✕" },
        enganoso: { rotulo: "Enganoso", icone: "!" },
        verdadeiro: { rotulo: "Verdadeiro", icone: "✓" },
    };

    const ROBOTIVE_AVATAR_SRC = "assets/mascot-image/BotImageChatAI.png";

    const elChat = document.getElementById("demoChat");
    const elLog = document.getElementById("demoChatLog");
    const elControles = document.getElementById("demoChatControls");

    // Se a seção não existir nessa página, encerra sem erro
    if (!elChat || !elLog || !elControles) return;

    let estado = "selecao"; // selecao | enviado | analisando | resultado
    let situacaoAtual = null;
    let timeoutAnalise = null;

    // Respeita quem prefere menos movimento: análise praticamente instantânea,
    // mas NUNCA infinita — o timeout sempre existe, com tempo maior ou menor.
    const prefereReduzirMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const TEMPO_ANALISE = prefereReduzirMovimento ? 400 : 1800;

    function autorRobotive() {
        return `
      <p class="demo-bubble__autor demo-bubble__autor--bot">
        <img class="demo-bubble__avatar" src="${ROBOTIVE_AVATAR_SRC}" alt="" aria-hidden="true" />
        Robôtive
      </p>
    `;
    }

    function bolhaUsuario(situacao) {
        return `
      <div class="demo-bubble demo-bubble--user">
        <p class="demo-bubble__autor"><span aria-hidden="true">👤</span> Você</p>
        <p class="demo-bubble__texto">${situacao.mensagem}</p>
      </div>
    `;
    }

    function bolhaResultado(situacao) {
        const info = CLASSIFICACOES[situacao.classificacao];
        const sinaisHtml = situacao.sinais
            .map((sinal) => `<li>${sinal}</li>`)
            .join("");

        return `
            <div class="demo-bubble demo-bubble--bot demo-bubble--bot-${situacao.classificacao}">
                ${autorRobotive()}
        <span class="demo-badge demo-badge--${situacao.classificacao}">
          <span class="demo-badge__icone" aria-hidden="true">${info.icone}</span>
          ${info.rotulo}
        </span>
        <p class="demo-bubble__texto">${situacao.explicacao}</p>
        <div class="demo-sinais">
          <p class="demo-sinais__titulo">Sinais para observar:</p>
          <ul>${sinaisHtml}</ul>
        </div>
      </div>
    `;
    }

    function renderizar() {
        // Sempre cancela um timeout pendente antes de trocar de estado —
        // é isso que impede qualquer chance de "análise" duplicada ou presa.
        if (timeoutAnalise) {
            window.clearTimeout(timeoutAnalise);
            timeoutAnalise = null;
        }

        if (estado === "selecao") {
            elLog.innerHTML = `
                <div class="demo-bubble demo-bubble--bot demo-bubble--boasvindas demo-bubble--bot-enganoso">
                    ${autorRobotive()}
          <p class="demo-bubble__texto">Escolha uma situação abaixo para ver como eu analiso o conteúdo.</p>
        </div>
      `;

            elControles.innerHTML = `
        <div class="demo-chips" role="group" aria-label="Situações disponíveis para simulação">
          ${situacoes
                    .map(
                        (situacao) => `
                <button type="button" class="demo-chip" data-acao="escolher" data-situacao-id="${situacao.id}">
                  ${situacao.rotulo}
                </button>
              `
                    )
                    .join("")}
        </div>
      `;
            return;
        }

        if (estado === "enviado") {
            elLog.innerHTML = bolhaUsuario(situacaoAtual);

            elControles.innerHTML = `
        <button type="button" class="demo-btn-enviar" data-acao="enviar">
          Enviar para análise
        </button>
        <button type="button" class="demo-btn-trocar" data-acao="trocar">
          Escolher outra situação
        </button>
      `;
            return;
        }

        if (estado === "analisando") {
            elLog.innerHTML = `
        ${bolhaUsuario(situacaoAtual)}
        <div class="demo-analisando" role="status">
          <span class="demo-spinner" aria-hidden="true"></span>
          Robôtive está analisando...
        </div>
      `;

            elControles.innerHTML = "";

            // Único ponto de avanço automático — sempre dispara, sem loop.
            timeoutAnalise = window.setTimeout(() => {
                estado = "resultado";
                renderizar();
            }, TEMPO_ANALISE);
            return;
        }

        if (estado === "resultado") {
            elLog.innerHTML = `
        ${bolhaUsuario(situacaoAtual)}
        ${bolhaResultado(situacaoAtual)}
      `;

            elControles.innerHTML = `
        <button type="button" class="demo-btn-reset" data-acao="reiniciar">
          Ver outra situação
        </button>
      `;

            // Move o foco pro resultado, pra quem usa teclado ou leitor de tela
            // perceber a resposta sem precisar procurar na tela.
            const bolhaBot = elLog.querySelector(".demo-bubble--bot");
            if (bolhaBot) {
                bolhaBot.setAttribute("tabindex", "-1");
                bolhaBot.focus();
            }
        }
    }

    // Delegação de eventos: os botões são recriados a cada render,
    // então ouvimos os cliques no container fixo, não nos botões.
    elChat.addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;

        const acao = botao.dataset.acao;

        if (acao === "escolher") {
            const situacaoId = botao.dataset.situacaoId;
            situacaoAtual = situacoes.find((s) => s.id === situacaoId) || null;
            if (!situacaoAtual) return;
            estado = "enviado";
            renderizar();
            return;
        }

        if (acao === "enviar") {
            estado = "analisando";
            renderizar();
            return;
        }

        if (acao === "trocar" || acao === "reiniciar") {
            estado = "selecao";
            situacaoAtual = null;
            renderizar();
        }
    });

    renderizar();
})();