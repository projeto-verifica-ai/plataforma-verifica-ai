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
    const btnFacebook = document.querySelector(".social-login .facebook");
    const btnGoogle = document.querySelector(".social-login .google");

    btnFacebook.addEventListener("click", () => {
        window.VerificaAI.loginComOAuth("facebook");
    });

    btnGoogle.addEventListener("click", () => {
        window.VerificaAI.loginComOAuth("google");
    });

    // Mostrar/ocultar senha — mesmo comportamento do ícone no cadastro
    olhoSenha.addEventListener("click", () => {
        if (senha.type === "password") {
            senha.type = "text";
            olhoSenha.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            senha.type = "password";
            olhoSenha.classList.replace("fa-eye-slash", "fa-eye");
        }
    });

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
