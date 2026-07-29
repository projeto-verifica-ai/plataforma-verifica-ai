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
