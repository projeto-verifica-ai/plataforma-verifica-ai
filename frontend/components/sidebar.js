class VerificaSidebar extends HTMLElement {
    connectedCallback() {
        // Pega a página atual para marcar o item ativo automaticamente
        const paginaAtual = window.location.pathname.split("/").pop();

        const navItems = [
            { href: "home.html", icon: "../assets/icons/icone-inicio.svg", label: "Início" },
            { href: "comunidade.html", icon: "../assets/icons/icone-comunidade.svg", label: "Comunidade" },
            { href: "noticias.html", icon: "../assets/icons/icone-noticias.svg", label: "Notícias atuais" },
            { href: "guia.html", icon: "../assets/icons/icone-guia.svg", label: "Guia rápido" },
        ];

        const navSecundario = [
            { href: "configuracoes.html", icon: "icone-configuracoes.png", label: "Configurações" },
            { href: "ajuda.html", icon: "icone-ajuda.png", label: "Ajuda" },
        ];

        const renderNav = (items) =>
            items.map(({ href, icon, label }) => `
        <a href="${href}" class="nav-item ${paginaAtual === href ? "nav-item--active" : ""}">
          <img src="assets/icons/${icon}" alt="" class="nav-icon" />
          <span>${label}</span>
        </a>
      `).join("");

        this.innerHTML = `
      <aside class="sidebar">

        <div class="sidebar-logo">
          <img src="../../assets/verificaai-robot-icon.png" alt="Logo Verifica AI" class="sidebar-logo-icon" />
          <span class="sidebar-logo-text">Verifica AÍ</span>
          <img src="../../assets/icons/icone-verificado.png" alt="Ícone de verificado" class="sidebar-verify-icon" />
        </div>

        <nav class="sidebar-nav">
          ${renderNav(navItems)}
        </nav>

        <hr class="sidebar-divider" />

        <nav class="sidebar-nav">
          ${renderNav(navSecundario)}
        </nav>

        <div class="sidebar-profile">
          <img src="assets/foto-usuario.png" alt="Foto de perfil" class="profile-avatar" />
          <div class="profile-info">
            <span class="profile-name">Olá, Maria!</span>
            <a href="perfil.html" class="profile-link">Ver meu perfil</a>
          </div>
        </div>

      </aside>
      
   <nav class="bottom-nav" aria-label="Navegação principal">
    <a href="home.html" class="bottom-nav-item ${paginaAtual === 'home.html' ? 'bottom-nav-item--active' : ''}">
      <img src="assets/icons/icone-inicio.png" alt="" class="bottom-nav-icon" />
      <span>Início</span>
    </a>
    <a href="perfil.html" class="bottom-nav-item ${paginaAtual === 'perfil.html' ? 'bottom-nav-item--active' : ''}">
      <img src="assets/icons/icone-perfil.png" alt="" class="bottom-nav-icon" />
      <span>Meu perfil</span>
    </a>
    <a href="ajuda.html" class="bottom-nav-item ${paginaAtual === 'ajuda.html' ? 'bottom-nav-item--active' : ''}">
      <img src="assets/icons/icone-ajuda.png" alt="" class="bottom-nav-icon" />
      <span>Ajuda</span>
    </a>
    <a href="configuracoes.html" class="bottom-nav-item ${paginaAtual === 'configuracoes.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-configuracoes.svg" alt="" class="bottom-nav-icon" />
      <span>Configurações</span>
    </a>
  </nav>
`;
    }

}



customElements.define("verifica-sidebar", VerificaSidebar);