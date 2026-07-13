// =========================================
// VERIFICA AI
// modal.js
// Controle do Modal dos Termos de Uso
// =========================================

function iniciarModal() {

    // ===============================
    // Abrir Modal
    // ===============================

    abrirTermos.addEventListener("click", abrirModal);

    // ===============================
    // Fechar Modal
    // ===============================

    fechar.addEventListener("click", fecharModal);

    cancelar.addEventListener("click", fecharModal);

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            fecharModal();

        }

    });

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            fecharModal();

        }

    });

    // ===============================
    // Aceitar Termos
    // ===============================

    aceitar.addEventListener("click", () => {

        checkbox.disabled = false;

        checkbox.checked = true;

        checkbox.disabled = true;

        modal.classList.remove("ativo");

        mostrarToast(
            "success",
            "Termos de Uso aceitos."
        );

    });

    // ===============================
    // Scroll do Modal
    // ===============================

    modalBody.addEventListener("scroll", verificarScrollModal);

}

// =========================================
// ABRIR MODAL
// =========================================

function abrirModal() {

    modal.classList.add("ativo");

    modalBody.scrollTop = 0;

    aceitar.disabled = true;

    scrollInfo.innerHTML =
        'Role até o final para habilitar o botão <strong>"Aceito"</strong>.';

    scrollInfo.style.color = "#777";

}

// =========================================
// FECHAR MODAL
// =========================================

function fecharModal() {

    modal.classList.remove("ativo");

    modalBody.scrollTop = 0;

}

// =========================================
// VERIFICAR SCROLL
// =========================================

function verificarScrollModal() {

    const chegouNoFinal =

        modalBody.scrollTop +
        modalBody.clientHeight >=
        modalBody.scrollHeight - 5;

    if (chegouNoFinal) {

        aceitar.disabled = false;

        scrollInfo.innerHTML =
            '✔ Você leu todo o documento.';

        scrollInfo.style.color = "#2C7444";

    }

}