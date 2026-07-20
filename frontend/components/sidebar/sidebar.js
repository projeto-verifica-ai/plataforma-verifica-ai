class VerificaSidebar extends HTMLElement {
  connectedCallback() {
    // Pega a página atual para marcar o item ativo automaticamente
    const paginaAtual = window.location.pathname.split("/").pop();

    const navItems = [
      { href: "../dashboard-principal/dashboard-principal.html", icon: "icone-inicio.svg", label: "Início" },
      { href: "../comunidade/comunidade.html", icon: "icone-comunidade.svg", label: "Comunidade" },
      { href: "../noticias/noticias.html", icon: "icone-noticias.svg", label: "Notícias atuais" },
      { href: "../guia-rapido/guia-rapido.html", icon: "icone-guia-rapido.svg", label: "Guia rápido" },
    ];

    const navSecundario = [
      { href: "configuracoes.html", icon: "icone-configuracao.svg", label: "Configurações" },
      { href: "ajuda.html", icon: "icone-ajuda.svg", label: "Ajuda" },
    ];

    const renderNav = (items) =>
      items.map(({ href, icon, label }) => `
        <a href="${href}" class="nav-item ${paginaAtual === href ? "nav-item--active" : ""}">
          <img src="../../assets/icons/${icon}" alt="" class="nav-icon" />
          <span>${label}</span>
        </a>
      `).join("");

    this.innerHTML = `
      <aside class="sidebar">

        <div class="sidebar-logo">
          <img src="../../assets/verificaai-robot-icon.png" alt="Logo Verifica AI" class="sidebar-logo-icon" />
          <span class="sidebar-logo-text">Verifica AÍ</span>
          <div class="verify-icon-div">
          <img src="../../assets/icons/icone-verificado.png" alt="Ícone de verificado" class="sidebar-verify-icon" />
          </div>
          </div>

        <nav class="sidebar-nav">
          ${renderNav(navItems)}
        </nav>

        <hr class="sidebar-divider" />

        <nav class="sidebar-nav">
          ${renderNav(navSecundario)}
        </nav>

        <div class="sidebar-profile">
        <!-- A foto de perfil aparecerá de acordo com o banco de dados do usuário, caso não tenha uma foto, será exibida a padrão. / -->
          <img src="assets/foto-usuario.png" alt="Foto de perfil" class="profile-avatar" />
          <div class="profile-info">
            <span class="profile-name">Olá, Maria!</span>
            <a href="perfil.html" class="profile-link">Ver meu perfil</a>
          </div>
        </div>

      </aside>
      
   <nav class="bottom-nav" aria-label="Navegação principal">
    <a href="home.html" class="bottom-nav-item ${paginaAtual === 'home.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-inicio.svg" alt="" class="bottom-nav-icon" />
      <span>Início</span>
    </a>
    <a href="perfil.html" class="bottom-nav-item ${paginaAtual === 'perfil.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-perfil.svg" alt="" class="bottom-nav-icon" />
      <span>Meu perfil</span>
    </a>
    <a href="ajuda.html" class="bottom-nav-item ${paginaAtual === 'ajuda.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-ajuda.svg" alt="" class="bottom-nav-icon" />
      <span>Ajuda</span>
    </a>
    <a href="configuracoes.html" class="bottom-nav-item ${paginaAtual === 'configuracoes.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-configuracao.svg" alt="" class="bottom-nav-icon" />
      <span>Configurações</span>
    </a>
  </nav>
`;
  }

}



customElements.define("verifica-sidebar", VerificaSidebar);