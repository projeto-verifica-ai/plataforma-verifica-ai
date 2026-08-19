import {
  pegarUsuarioAtual,
  pegarPerfil,
  pegarUrlAvatar,
  trocarAvatar,
  fazerLogout,
} from "../../services/appwrite.js";

class VerificaSidebar extends HTMLElement {
  connectedCallback() {
    // Pega a página atual para marcar o item ativo automaticamente
    const paginaAtual = window.location.pathname.split("/").pop();

    const navItems = [
      { href: "../dashboard-principal/dashboard-principal.html", icon: "icone-inicio.svg", label: "Início" },
      { href: "../dashboard-comunidade/comunidade.html", icon: "icone-comunidade.svg", label: "Comunidade" },
      { href: "../noticias/tela-noticias.html", icon: "icone-noticias.svg", label: "Notícias atuais" },
      { href: "../guia-rapido/guia-rapido.html", icon: "icone-guia-rapido.svg", label: "Guia rápido" },
    ];

    const navSecundario = [
      { href: "#", icon: "icone-configuracao.svg", label: "Configurações" },
      { href: "../tela-ajuda/tela-ajuda.html", icon: "icone-ajuda.svg", label: "Ajuda" },
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
          <img src="../../assets/mascot/verificaai-robot-nobackground.png" alt="Logo Verifica AI" class="sidebar-logo-icon" />
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
        <!-- Nome real e foto vêm do Appwrite (carregarPerfil). Clicar na foto troca o avatar (só quando logado). -->
          <img src="../../assets/foto-usuario.png" alt="Foto de perfil" class="profile-avatar" id="profile-avatar" />
          <input type="file" accept="image/*" id="avatar-input" hidden />
          <div class="profile-info">
            <span class="profile-name">Olá!</span>
            <div class="profile-links">
              <a href="../perfil/perfil.html" class="profile-link">Ver meu perfil</a>
              <a href="#" class="profile-link profile-link--sair" hidden>Sair</a>
            </div>
          </div>
        </div>

      </aside>
      
   <nav class="bottom-nav" aria-label="Navegação principal">
    <a href="../dashboard-principal/dashboard-principal.html" class="bottom-nav-item ${paginaAtual === 'dashboard-principal.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-inicio.svg" alt="" class="bottom-nav-icon" />
      <span>Início</span>
    </a>
    <a href="../perfil/perfil.html" class="bottom-nav-item ${paginaAtual === 'perfil.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-perfil.svg" alt="" class="bottom-nav-icon" />
      <span>Meu perfil</span>
    </a>
    <a href="../tela-ajuda/tela-ajuda.html" class="bottom-nav-item ${paginaAtual === 'tela-ajuda.html' ? 'bottom-nav-item--active' : ''}">
      <img src="../../assets/icons/icone-ajuda.svg" alt="" class="bottom-nav-icon" />
      <span>Ajuda</span>
    </a>
    <a href="#" class="bottom-nav-item"> <!-- TODO: página ainda não criada -->
      <img src="../../assets/icons/icone-configuracao.svg" alt="" class="bottom-nav-icon" />
      <span>Configurações</span>
    </a>
  </nav>
`;

    this.carregarPerfil();
  }

  // Busca o usuário logado + a linha em "profiles" e atualiza o nome
  // exibido na sidebar. Roda depois do render pra não travar a página
  // esperando a resposta do Appwrite (sidebar aparece na hora, o nome
  // só é trocado quando a resposta chega).
  async carregarPerfil() {
    const elNome = this.querySelector(".profile-name");
    const elLink = this.querySelector(".profile-link");
    const elSair = this.querySelector(".profile-link--sair");
    const elAvatar = this.querySelector("#profile-avatar");
    const elAvatarInput = this.querySelector("#avatar-input");

    let usuario;
    try {
      usuario = await pegarUsuarioAtual();
    } catch {
      usuario = null;
    }

    if (!usuario) {
      elNome.textContent = "Olá, visitante!";
      elLink.textContent = "Entrar";
      elLink.href = "../pagina-login/pagina-login.html";
      return;
    }

    // Nome do Auth já serve de fallback imediato enquanto o perfil carrega
    elNome.textContent = `Olá, ${usuario.name}!`;

    // Usuário logado: mostra o link de sair
    elSair.hidden = false;
    elSair.addEventListener("click", async (evento) => {
      evento.preventDefault();
      try {
        await fazerLogout();
      } catch (error_) {
        console.error("Não foi possível encerrar a sessão:", error_);
      }
      window.location.href = "../pagina-login/pagina-login.html";
    });

    // Clicar na foto abre o seletor de arquivo (só funciona logado)
    elAvatar.classList.add("profile-avatar--clicavel");
    elAvatar.setAttribute("role", "button");
    elAvatar.setAttribute("tabindex", "0");
    elAvatar.title = "Clique para trocar a foto de perfil";
    elAvatar.addEventListener("click", () => elAvatarInput.click());
    elAvatar.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        elAvatarInput.click();
      }
    });

    elAvatarInput.addEventListener("change", async () => {
      const arquivo = elAvatarInput.files[0];
      if (!arquivo) return;

      const urlAnterior = elAvatar.src;
      elAvatar.style.opacity = "0.5";

      try {
        const novaUrl = await trocarAvatar(usuario.$id, arquivo);
        elAvatar.src = novaUrl;
      } catch (error_) {
        console.error("Não foi possível trocar a foto de perfil:", error_);
        elAvatar.src = urlAnterior;
      } finally {
        elAvatar.style.opacity = "";
        elAvatarInput.value = "";
      }
    });

    try {
      const perfil = await pegarPerfil(usuario.$id);
      if (perfil?.name) {
        elNome.textContent = `Olá, ${perfil.name}!`;
      }
      if (perfil?.avatarField) {
        elAvatar.src = pegarUrlAvatar(perfil.avatarField);
      }
    } catch (error_) {
      console.error("Não foi possível carregar o perfil do usuário:", error_);
    }
  }

}



customElements.define("verifica-sidebar", VerificaSidebar);
