/* ============================================================
   DESAFIOS.JS — Verifica AI
   Componente de desafio das trilhas. Cobre os dois tipos existentes:
   - "alternativa": pergunta com opções de múltipla escolha (radio)
   - "imagem": pergunta com imagens clicáveis
   O tipo é escolhido pelo atributo `tipo` no HTML.
   Uso:
   <verifica-desafio id="d1" tipo="alternativa" pergunta="..."></verifica-desafio>
   <verifica-desafio id="d2" tipo="imagem" pergunta="..."></verifica-desafio>
   As opções são definidas depois, via propriedade JS:
   document.getElementById('d1').opcoes = [{ id, texto, correta }]
   ============================================================ */

class VerificaDesafio extends HTMLElement {

  // Construtor: roda uma única vez, quando o elemento é criado.
  // Aqui inicializamos o estado interno do componente (o que o usuário
  // escolheu, e se ele já enviou a resposta).
  constructor() {
    super();
    this._selecionada = null;  // id da opção que o usuário selecionou
    this._respondido = false;  // true depois que a resposta foi confirmada
  }

  // Setter: quando a página fizer `elemento.opcoes = [...]`,
  // guarda o array e já re-renderiza o componente com essas opções.
  set opcoes(valor) {
    this._opcoes = valor;
    this.render();
  }

  // Getter: evita erro de "undefined.map" caso ninguém tenha setado opcoes ainda.
  get opcoes() {
    return this._opcoes || [];
  }

  // Setter usado para "reidratar" o componente quando o usuário já
  // respondeu esse desafio antes (resposta vinda do backend/estado salvo).
  set respostaSalva(valor) {
    if (valor) {
      this._selecionada = valor.opcaoId;
      this._respondido = true;
    }
    this.render();
  }

  // Chamado automaticamente quando o elemento entra no DOM.
  connectedCallback() {
    this.render();
  }

  // Decide qual template usar (imagem ou alternativa) com base no
  // atributo `tipo`, e monta o HTML do componente.
  render() {
    const tipo = this.getAttribute("tipo");
    const pergunta = this.getAttribute("pergunta") || "erro";
    const textoComplementar = this.getAttribute("textoComplementar") || "erro";


    // Ramo do desafio de IMAGEM
    if (tipo === "imagem") {
      this.innerHTML = `
        <div class="desafio">
          <p class="desafio-pergunta">${pergunta}</p>
          <p class="desafio-texto-complementar">${textoComplementar}</p>
          <div class="desafio-imagens">
            ${this.opcoes.map((opcao) => this.templateImagem(opcao)).join("")}
          </div>
          ${this.templateResultado()}
        </div>
      `;
      // Precisa re-anexar os eventos de clique toda vez que o innerHTML é recriado,
      // porque os elementos antigos (com os listeners antigos) foram destruídos.
      this.attachEventosImagem();
      return;
    }

    // Ramo do desafio de ALTERNATIVA (comportamento padrão)
    this.innerHTML = `
      <div class="desafio">
        <p class="desafio-pergunta">${pergunta}</p>
        <div class="desafio-opcoes">
          ${this.opcoes.map((opcao) => this.templateOpcao(opcao)).join("")}
        </div>
        <button class="desafio-botao-enviar" ${this._respondido ? "hidden" : ""} ${!this._selecionada ? "disabled" : ""}>
          Enviar resposta
        </button>
        ${this.templateResultado()}
      </div>
    `;
    this.attachEventosAlternativa();
  }

  // Gera o HTML de uma única opção de alternativa (radio + texto),
  // já aplicando a cor de certo/errado se o desafio já foi respondido.
  templateOpcao(opcao) {
    const marcado = opcao.id === this._selecionada;

    // Só pinta de verde/vermelho depois que o usuário já respondeu
    const classeEstado = this._respondido
      ? opcao.correta
        ? "opcao--correta"
        : marcado
        ? "opcao--incorreta"
        : ""
      : "";

    return `
      <label class="opcao ${classeEstado}" data-opcao-id="${opcao.id}">
        <input
          type="radio"
          name="${this.id}"
          value="${opcao.id}"
          ${marcado ? "checked" : ""}
          ${this._respondido ? "disabled" : ""}
        />
        <span>${opcao.texto}</span>
      </label>
    `;
  }

  // Gera o HTML de uma imagem clicável, com a mesma lógica de
  // cor de certo/errado do templateOpcao.
  templateImagem(opcao) {
    const classeEstado = this._respondido
      ? opcao.correta
        ? "imagem-opcao--correta"
        : opcao.id === this._selecionada
        ? "imagem-opcao--incorreta"
        : ""
      : "";

    return `
      <button class="imagem-opcao ${classeEstado}" data-opcao-id="${opcao.id}" ${this._respondido ? "disabled" : ""}>
        <img src="${opcao.src}" alt="${opcao.label}" />
        <span class="imagem-opcao-label">${opcao.label}</span>
      </button>
    `;
  }

  // Gera a mensagem final ("Resposta correta!" / "Não foi dessa vez.")
  // Só aparece depois que o usuário respondeu.
  templateResultado() {
    if (!this._respondido) return "";
    const opcao = this.opcoes.find((o) => o.id === this._selecionada);
    const correta = !!opcao?.correta;
    const classe = correta ? "desafio-resultado--correta" : "desafio-resultado--incorreta";
    const texto = correta ? "Resposta correta!" : "Não foi dessa vez.";
    return `<p class="desafio-resultado ${classe}">${texto}</p>`;
  }

  // Liga os eventos do desafio de ALTERNATIVA:
  // - marcar uma opção habilita o botão "Enviar resposta"
  // - clicar no botão confirma a resposta
  attachEventosAlternativa() {
    this.querySelectorAll("input[type=radio]").forEach((input) => {
      input.addEventListener("change", (evento) => {
        this._selecionada = evento.target.value;
        const botao = this.querySelector(".desafio-botao-enviar");
        botao.disabled = false;
      });
    });

    const botao = this.querySelector(".desafio-botao-enviar");
    if (botao) {
      botao.addEventListener("click", () => this.confirmarResposta());
    }
  }

  // Liga os eventos do desafio de IMAGEM:
  // clicar numa imagem já confirma a resposta na hora (sem botão "Enviar").
  attachEventosImagem() {
    this.querySelectorAll(".imagem-opcao").forEach((botao) => {
      botao.addEventListener("click", () => {
        if (this._respondido) return; // trava novo clique depois de já ter respondido
        this._selecionada = botao.dataset.opcaoId;
        this.confirmarResposta();
      });
    });
  }

  // Executa a confirmação da resposta:
  // 1. Descobre se a opção escolhida é a correta
  // 2. Marca o desafio como respondido
  // 3. Emite um evento customizado avisando quem estiver ouvindo
  //    (por exemplo, o guia-rapido.js, que futuramente vai salvar isso no Appwrite)
  // 4. Re-renderiza pra já mostrar o resultado na tela
  confirmarResposta() {
    const opcao = this.opcoes.find((o) => o.id === this._selecionada);
    const correta = !!opcao?.correta;
    this._respondido = true;

    this.dispatchEvent(
      new CustomEvent("desafio-respondido", {
        bubbles: true, // permite que o evento "suba" e seja ouvido em document ou em outro ancestral
        detail: {
          desafioId: this.id,
          opcaoId: this._selecionada,
          correta,
        },
      })
    );

    this.render();
  }
}

// Registra a tag <verifica-desafio> no navegador, ligando-a a essa classe.
customElements.define("verifica-desafio", VerificaDesafio);