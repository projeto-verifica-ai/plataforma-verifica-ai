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

async function enviarFormulario(e) {

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

    btnCriarConta.disabled = true;

    try {

        await window.VerificaAI.criarConta({
            nome: nome.value.trim(),
            email: email.value.trim(),
            senha: senha.value,
        });

        mostrarToast(
            "success",
            "Cadastro realizado com sucesso!"
        );

        resetarFormulario();

        window.location.href = "../dashboard-principal/dashboard-principal.html";

    } catch (erro) {

        mostrarToast(
            "error",
            erro?.message || "Não foi possível criar a conta. Tente novamente."
        );

    } finally {

        btnCriarConta.disabled = false;

    }

}