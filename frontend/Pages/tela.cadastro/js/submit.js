// =========================================
// VERIFICA AI
// submit.js
// Envio do formulário
// =========================================

function iniciarSubmit() {

    formulario.addEventListener("submit", enviarFormulario);

}

// =========================================
// ENVIAR FORMULÁRIO
// =========================================

function enviarFormulario(e) {

    e.preventDefault();

    limparErros();

    let valido = true;

    // ===============================
    // Nome
    // ===============================

    if (nome.value.trim() === "") {

        mostrarErro(
            nome,
            erroNome,
            "Digite seu nome."
        );

        valido = false;

    } else {

        mostrarSucesso(nome);

    }

    // ===============================
    // Email
    // ===============================

    if (!validarEmail(email.value)) {

        mostrarErro(
            email,
            erroEmail,
            "Digite um e-mail válido."
        );

        valido = false;

    } else {

        mostrarSucesso(email);

    }

    // ===============================
    // Senha
    // ===============================

    if (senha.value.length < 6) {

        mostrarErro(
            senha,
            erroSenha,
            "A senha deve possuir no mínimo 6 caracteres."
        );

        valido = false;

    } else {

        mostrarSucesso(senha);

    }

    // ===============================
    // Confirmar senha
    // ===============================

    if (confirmarSenha.value.trim() === "") {

        confirmarSenha.classList.remove("erro");
        confirmarSenha.classList.remove("sucesso");

        erroConfirmar.textContent = "";

        valido = false;

    }

    else if (senha.value !== confirmarSenha.value) {

        mostrarErro(
            confirmarSenha,
            erroConfirmar,
            "As senhas não coincidem."
        );

        valido = false;

    }

    else {

        mostrarSucesso(confirmarSenha);

    }

    // ===============================
    // Termos
    // ===============================

    if (!checkbox.checked) {

        mostrarToast(
            "error",
            "Você precisa aceitar os Termos de Uso."
        );

        valido = false;

    }

    // ===============================
    // Cadastro
    // ===============================

    if (!valido) return;

    mostrarToast(
        "success",
        "Cadastro realizado com sucesso!"
    );

    resetarFormulario();

}