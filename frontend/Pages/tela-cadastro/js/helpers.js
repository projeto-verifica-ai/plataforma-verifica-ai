// =========================================
// VERIFICA AI
// helpers.js
// Funções auxiliares
// =========================================

// =========================================
// MOSTRAR ERRO
// =========================================

function mostrarErro(input, small, mensagem) {

    input.classList.remove("sucesso");

    input.classList.add("erro");

    small.textContent = mensagem;

}

// =========================================
// MOSTRAR SUCESSO
// =========================================

function mostrarSucesso(input, small) {

    input.classList.remove("erro");

    input.classList.add("sucesso");

    if (small) {

        small.textContent = "";

    }

}

// =========================================
// LIMPAR ERROS
// =========================================

function limparErros() {

    document.querySelectorAll("small").forEach(item => {

        item.textContent = "";

    });

    document.querySelectorAll(".campo input").forEach(input => {

        input.classList.remove("erro");

        input.classList.remove("sucesso");

    });

}

// =========================================
// VALIDAR EMAIL
// =========================================

function validarEmail(email) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}

// =========================================
// RESETAR FORMULÁRIO
// =========================================

function resetarFormulario() {

    formulario.reset();

    limparErros();

    senha.type = "password";

    confirmarSenha.type = "password";

    olhoSenha.querySelector("img").src = "../../assets/icons/icone-olho.svg";
    olhoSenha.setAttribute("aria-pressed", "false");
    olhoSenha.setAttribute("aria-label", "Mostrar senha");

    olhoConfirmar.querySelector("img").src = "../../assets/icons/icone-olho.svg";
    olhoConfirmar.setAttribute("aria-pressed", "false");
    olhoConfirmar.setAttribute("aria-label", "Mostrar confirmação de senha");

    strengthBar.style.width = "0%";

    strengthBar.style.background = "#E6E6E6";

    strengthText.textContent = "";

    checkbox.checked = false;

}
