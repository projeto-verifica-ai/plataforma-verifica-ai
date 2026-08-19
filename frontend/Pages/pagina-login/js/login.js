// =========================================
// VERIFICA AI
// login.js
// Envio do formulário de login
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const erro = document.getElementById("loginErro");
    const btnLogin = document.getElementById("btnLogin");
    const olhoSenha = document.getElementById("olhoSenha");
    const olhoSenhaImg = olhoSenha?.querySelector("img");
    const btnFacebook = document.querySelector(".social-login .facebook");
    const btnGoogle = document.querySelector(".social-login .google");

    btnFacebook.addEventListener("click", () => {
        window.VerificaAI.loginComOAuth("facebook");
    });

    btnGoogle.addEventListener("click", () => {
        window.VerificaAI.loginComOAuth("google");
    });

    function atualizarEstadoSenha() {
        const senhaVisivel = senha.type === "text";

        olhoSenha.setAttribute("aria-pressed", String(senhaVisivel));
        olhoSenha.setAttribute("aria-label", senhaVisivel ? "Ocultar senha" : "Mostrar senha");
        olhoSenhaImg.src = senhaVisivel
            ? "../../assets/icons/icone-olho-fechado.svg"
            : "../../assets/icons/icone-olho.svg";
    }

    // Mostrar/ocultar senha — mesmo comportamento do cadastro
    olhoSenha.addEventListener("click", () => {
        senha.type = senha.type === "password" ? "text" : "password";
        atualizarEstadoSenha();
    });

    atualizarEstadoSenha();

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        erro.textContent = "";

        btnLogin.disabled = true;

        try {

            await window.VerificaAI.fazerLogin({
                email: email.value.trim(),
                senha: senha.value,
            });

            window.location.href = "../dashboard-principal/dashboard-principal.html";

        } catch (falha) {

            erro.textContent = falha?.message || "E-mail ou senha inválidos.";

        } finally {

            btnLogin.disabled = false;

        }

    });

});
