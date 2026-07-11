// =========================================
// VERIFICA AI
// validation.js
// Validações em tempo real
// =========================================

function iniciarValidacoes() {

    // ===============================
    // Remove estilos ao digitar
    // ===============================

    [nome, email, senha, confirmarSenha].forEach(campo => {

        campo.addEventListener("input", () => {

            campo.classList.remove("erro");
            campo.classList.remove("sucesso");

        });

    });

    // ===============================
    // Validações em tempo real
    // ===============================

    nome.addEventListener("input", validarNome);

    email.addEventListener("input", validarEmailCampo);

    senha.addEventListener("input", () => {

        validarSenhaCampo();

        validarConfirmacao();

    });

    confirmarSenha.addEventListener("input", validarConfirmacao);

}

// =========================================
// VALIDAR NOME
// =========================================

function validarNome() {

    if (nome.value.trim().length < 3) {

        mostrarErro(
            nome,
            erroNome,
            "Digite pelo menos 3 caracteres."
        );

        return false;

    }

    erroNome.textContent = "";

    mostrarSucesso(nome);

    return true;

}

// =========================================
// VALIDAR EMAIL
// =========================================

function validarEmailCampo() {

    if (!validarEmail(email.value)) {

        mostrarErro(
            email,
            erroEmail,
            "Digite um e-mail válido."
        );

        return false;

    }

    erroEmail.textContent = "";

    mostrarSucesso(email);

    return true;

}

// =========================================
// VALIDAR SENHA
// =========================================

function validarSenhaCampo() {

    if (senha.value.length < 6) {

        mostrarErro(
            senha,
            erroSenha,
            "A senha deve possuir no mínimo 6 caracteres."
        );

        return false;

    }

    erroSenha.textContent = "";

    mostrarSucesso(senha);

    return true;

}

// =========================================
// VALIDAR CONFIRMAÇÃO
// =========================================

function validarConfirmacao() {

    if (confirmarSenha.value === "") {

        confirmarSenha.classList.remove("erro");
        confirmarSenha.classList.remove("sucesso");

        erroConfirmar.textContent = "";

        return false;

    }

    if (confirmarSenha.value !== senha.value) {

        mostrarErro(
            confirmarSenha,
            erroConfirmar,
            "As senhas não coincidem."
        );

        return false;

    }

    erroConfirmar.textContent = "";

    mostrarSucesso(confirmarSenha);

    return true;

}
