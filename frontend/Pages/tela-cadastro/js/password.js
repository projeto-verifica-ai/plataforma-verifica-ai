// =========================================
// VERIFICA AI
// password.js
// Mostrar senha e força da senha
// =========================================

function iniciarPassword() {

    const olhoSenhaImg = olhoSenha.querySelector("img");
    const olhoConfirmarImg = olhoConfirmar.querySelector("img");

    function atualizarEstadoSenha(botao, icone, input, labelMostrar, labelOcultar) {

        const senhaVisivel = input.type === "text";

        botao.setAttribute("aria-pressed", String(senhaVisivel));
        botao.setAttribute("aria-label", senhaVisivel ? labelOcultar : labelMostrar);

        icone.src = senhaVisivel
            ? "../../assets/icons/icone-olho-fechado.svg"
            : "../../assets/icons/icone-olho.svg";

    }

    // ===============================
    // Mostrar/Ocultar Senha
    // ===============================

    olhoSenha.addEventListener("click", () => {

        senha.type = senha.type === "password" ? "text" : "password";

        atualizarEstadoSenha(
            olhoSenha,
            olhoSenhaImg,
            senha,
            "Mostrar senha",
            "Ocultar senha"
        );

    });

    // ===============================
    // Mostrar/Ocultar Confirmar Senha
    // ===============================

    olhoConfirmar.addEventListener("click", () => {

        confirmarSenha.type = confirmarSenha.type === "password" ? "text" : "password";

        atualizarEstadoSenha(
            olhoConfirmar,
            olhoConfirmarImg,
            confirmarSenha,
            "Mostrar confirmação de senha",
            "Ocultar confirmação de senha"
        );

    });

    atualizarEstadoSenha(
        olhoSenha,
        olhoSenhaImg,
        senha,
        "Mostrar senha",
        "Ocultar senha"
    );

    atualizarEstadoSenha(
        olhoConfirmar,
        olhoConfirmarImg,
        confirmarSenha,
        "Mostrar confirmação de senha",
        "Ocultar confirmação de senha"
    );

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
