/* ============================================================
   ARTIGOS.JS — Verifica AI
   Componente de artigo (bloco de leitura teórica das trilhas).
   Uso: <verifica-artigo titulo="..." tempo-leitura="6" atualizado-em="..."></verifica-artigo>
   O conteúdo (parágrafos) é definido depois, via propriedade JS:
   document.getElementById('meu-artigo').paragrafos = ['texto 1', 'texto 2']
   ============================================================ */

class VerificaArtigo extends HTMLElement {

    // Setter customizado: sempre que alguém fizer `elemento.paragrafos = [...]`,
    // guarda o valor internamente e já dispara o render de novo.
    set paragrafos(valor) {
        this._paragrafos = valor;
        this.render();
    }

    // Getter: se ninguém setou paragrafos ainda, retorna array vazio
    // (evita erro de "undefined.map" no render).
    get paragrafos() {
        return this._paragrafos || [];
    }

    // Chamado automaticamente pelo navegador quando o elemento é inserido no DOM.
    // Faz o primeiro render, mesmo que "paragrafos" ainda não tenha sido setado.
    connectedCallback() {
        this.render();
    }

    // Monta o HTML interno do componente a partir dos atributos e da propriedade paragrafos.
    render() {
        // Atributos vêm sempre como string, direto do HTML declarado na página.
        const titulo = this.getAttribute("titulo") || "";
        const tempoLeitura = this.getAttribute("tempo-leitura") || "";
        const atualizadoEm = this.getAttribute("atualizado-em") || "";

        // Transforma o array de parágrafos em uma string HTML, um <p> por item.
        const paragrafosHtml = this.paragrafos
            .map((paragrafo) => `<p class="artigo-paragrafo">${paragrafo}</p>`)
            .join("");

        // Substitui todo o conteúdo interno do <verifica-artigo> pelo template montado.
        this.innerHTML = `
      <article class="artigo">
        <h1 class="artigo-titulo">${titulo}</h1>
         <div class="tempo-leitura">
        <img class="imagem-tempo" src="../../assets/icons/relogio-guia-rapido.png" alt="Imagem de relógio" loading="lazy" width="16" height="16" decoding="async" />
        <span class="artigo-meta">${tempoLeitura} min de leitura</span>
        </div>
        <div class="artigo-conteudo">
          ${paragrafosHtml}
        </div>
        <span class="artigo-atualizado">Atualizado em ${atualizadoEm}</span>
      </article>
    `;
    }
}

// Registra a tag <verifica-artigo> no navegador, ligando-a a essa classe.
customElements.define("verifica-artigo", VerificaArtigo);
