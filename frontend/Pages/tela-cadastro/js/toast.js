// =========================================
// VERIFICA AI
// toast.js
// Sistema de notificações
// =========================================

function mostrarToast(tipo, mensagem) {

    toast.classList.remove("success");
    toast.classList.remove("error");

    if (tipo === "success") {

        toast.classList.add("success");

        toastIcon.src = "../../assets/icons/icone-sucesso.svg";

    }

    else if (tipo === "error") {

        toast.classList.add("error");

        toastIcon.src = "../../assets/icons/icone-erro.svg";

    }

    toastMessage.textContent = mensagem;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}
