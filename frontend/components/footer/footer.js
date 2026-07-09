/* ============================================================
   FOOTER.JS — Verifica AI
   Componente de rodapé reutilizável.
   Uso: <verifica-footer></verifica-footer>
   ============================================================ */

class VerificaFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <p class="footer-text">
          Verifica AI © 2026 — Projeto de Educação Digital e Combate à Desinformação
        </p>
      </footer>
    `;
  }
}

customElements.define("verifica-footer", VerificaFooter);