/* ============================================================
   TRILHAS.JS — Verifica AI
   Componente de tabs das trilhas (barra de navegação entre as
   trilhas do Guia Rápido). Mostra qual trilha está ativa e quais
   ainda estão bloqueadas (com ícone de cadeado).
   Uso: <verifica-trilha-tabs id="trilha-tabs"></verifica-trilha-tabs>
   Dados via propriedade JS:
   elemento.trilhas = [{ id, titulo, bloqueada }]
   elemento.ativa = 'id-da-trilha-atual'
   Emite o evento "trilha-selecionada" quando o usuário clica
   numa trilha desbloqueada.
   ============================================================ */

class VerificaTrilhaTabs extends HTMLElement {

    // Inicializa o estado interno com valores vazios,
    // caso a página ainda não tenha setado nada.
    constructor() {
        super();
        this._trilhas = [];
        this._ativa = null;
    }

    // Setter: recebe a lista completa de trilhas e re-renderiza.
    set trilhas(valor) {
        this._trilhas = valor;
        this.render();
    }

    get trilhas() {
        return this._trilhas;
    }

    // Setter: define qual trilha está marcada como ativa (pill azul).
    set ativa(valor) {
        this._ativa = valor;
        this.render();
    }

    get ativa() {
        return this._ativa;
    }

    // Primeiro render, quando o elemento entra no DOM.
    connectedCallback() {
        this.render();
    }

    // Monta o HTML de cada trilha (ativa, bloqueada ou normal)
    // e junta tudo dentro de um <nav>.
    render() {
        const itens = this.trilhas
            .map((trilha, indice) => {
                // Não mostra divisor "|" antes do primeiro item da lista
                const divisor = indice > 0 ? '<span class="trilha-tab-divisor"></span>' : "";
                const ativa = trilha.id === this.ativa;

                // Trilha ATIVA: pill azul com ícone de "documento"
                if (ativa) {
                    return `
            ${divisor}
            <button class="trilha-tab trilha-tab--ativa" data-trilha-id="${trilha.id}">
            <img class="trilha-tab-icone" src="../../assets/icons/pagina-atual-icon.png" alt="Ícone de cadeado trancado" />
              <span>${trilha.titulo}</span>
            </button>
          `;
                }

                // Trilha BLOQUEADA: ícone de cadeado, botão desabilitado
                if (trilha.bloqueada) {
                    return `
            ${divisor}
            <button class="trilha-tab trilha-tab--bloqueada" disabled data-trilha-id="${trilha.id}">
              <img class="trilha-tab-icone" src="../../assets/icons/bloqueado-icon.png" alt="Ícone de cadeado trancado" />
              <span>${trilha.titulo}</span>
            </button>
          `;
                }

                // Trilha DESBLOQUEADA mas não ativa: cadeado aberto, clicável
                return `
          ${divisor}
          <button class="trilha-tab" data-trilha-id="${trilha.id}">
             <img class="trilha-tab-icone" src="../../assets/icons/desbloqueado-icon.png" alt="Ícone de cadeado aberto" />
            <span>${trilha.titulo}</span>
          </button>
        `;
            })
            .join("");

        this.innerHTML = `<nav class="trilha-tabs">${itens}</nav>`;

        // Anexa o clique só nos botões que NÃO estão bloqueados
        // (o seletor ":not(.trilha-tab--bloqueada)" já filtra isso).
        this.querySelectorAll(".trilha-tab:not(.trilha-tab--bloqueada)").forEach((botao) => {
            botao.addEventListener("click", () => {
                const trilhaId = botao.dataset.trilhaId;

                // Avisa quem estiver ouvindo (o guia-rapido.js) qual trilha foi escolhida.
                // O "bubbles: true" permite ouvir esse evento em document.
                this.dispatchEvent(
                    new CustomEvent("trilha-selecionada", {
                        bubbles: true,
                        detail: { trilhaId },
                    })
                );
            });
        });
    }
}

// Registra a tag <verifica-trilha-tabs> no navegador.
customElements.define("verifica-trilha-tabs", VerificaTrilhaTabs);