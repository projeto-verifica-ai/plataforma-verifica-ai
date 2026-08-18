// Criando interação do FAQ

// Seleciona todos os botões das perguntas
const botoesFaq = document.querySelectorAll(".botao-faq");

botoesFaq.forEach(function (botao) {

  // Espera o usuário clicar no botão
  botao.addEventListener("click", function () {

    const resposta = botao.nextElementSibling;
    const icone = botao.querySelector(".icone-faq");

    // Fecha todas as outras respostas
    botoesFaq.forEach(function (outroBotao) {

      if (outroBotao !== botao) {

        const outraResposta = outroBotao.nextElementSibling;
        const outroIcone = outroBotao.querySelector(".icone-faq");

        outraResposta.style.maxHeight = "0";
        outraResposta.style.opacity = "0";

        outroIcone.style.transform = "rotate(0deg)";
      }

    });

    // Verifica se a resposta está fechada
    if (resposta.style.maxHeight === "0px" || resposta.style.maxHeight === "") {

      // Abre a resposta
      resposta.style.maxHeight = resposta.scrollHeight + "px";
      resposta.style.opacity = "1";

      // Gira a seta
      icone.style.transform = "rotate(180deg)";

    } else {

      // Fecha a resposta
      resposta.style.maxHeight = "0";
      resposta.style.opacity = "0";

      // Volta a seta
      icone.style.transform = "rotate(0deg)";
    }

  });

});