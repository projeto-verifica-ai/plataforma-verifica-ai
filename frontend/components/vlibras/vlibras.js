/**
 * Inicializa o VLibras em todas as páginas que carregam este componente.
 * A marcação segue a integração oficial do VLibras Widget.
 */
(function inicializarVLibras() {
  if (document.querySelector("[vw]")) return;

  const container = document.createElement("div");
  container.setAttribute("vw", "");
  container.className = "enabled";
  container.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  `;
  document.body.appendChild(container);

  const script = document.createElement("script");
  script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  script.onload = () => {
    if (window.VLibras?.Widget) {
      new window.VLibras.Widget("https://vlibras.gov.br/app");
    }
  };
  document.body.appendChild(script);
})();
