// =========================================
// VERIFICA AI
// password.js
// Mostrar senha e força da senha
// =========================================

function iniciarPassword() {

    // ===============================
    // Mostrar/Ocultar Senha
    // ===============================

    olhoSenha.addEventListener("click", () => {

        if (senha.type === "password") {

            senha.type = "text";

            olhoSenha.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        } else {

            senha.type = "password";

            olhoSenha.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    });

    // ===============================
    // Mostrar/Ocultar Confirmar Senha
    // ===============================

    olhoConfirmar.addEventListener("click", () => {

        if (confirmarSenha.type === "password") {

            confirmarSenha.type = "text";

            olhoConfirmar.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        } else {

            confirmarSenha.type = "password";

            olhoConfirmar.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    });

    // ===============================
    // Barra de força
    // ===============================

    senha.addEventListener("input", verificarForcaSenha);

}

// =========================================
// FORÇA DA SENHA
// =========================================

function verificarForcaSenha() {

    let pontos = 0;

    if (senha.value.length >= 8) pontos++;

    if (/[A-Z]/.test(senha.value)) pontos++;

    if (/[a-z]/.test(senha.value)) pontos++;

    if (/[0-9]/.test(senha.value)) pontos++;

    if (/[!@#$%^&*(),.?":{}|<>]/.test(senha.value)) pontos++;

    switch (pontos) {

        case 0:

            strengthBar.style.width = "0%";
            strengthBar.style.background = "#E6E6E6";
            strengthText.innerHTML = "";

            break;

        case 1:
        case 2:

            strengthBar.style.width = "35%";
            strengthBar.style.background = "#E53935";
            strengthText.innerHTML = "Senha fraca";

            break;

        case 3:
        case 4:

            strengthBar.style.width = "70%";
            strengthBar.style.background = "#FFC107";
            strengthText.innerHTML = "Senha média";

            break;

        case 5:

            strengthBar.style.width = "100%";
            strengthBar.style.background = "#2E7D32";
            strengthText.innerHTML = "Senha forte";

            break;

    }

}