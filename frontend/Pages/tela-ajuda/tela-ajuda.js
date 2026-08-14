// Criando interação do faq

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

        outroBotao.nextElementSibling.style.display = "none";

        // Faz a seta voltar para a posição inicial
        const outroIcone = outroBotao.querySelector(".icone-faq");
        outroIcone.style.transform = "rotate(0deg)";
      }

    });

    // Abre ou fecha a resposta selecionada
    if (resposta.style.display === "none") {

      resposta.style.display = "block";
      icone.style.transform = "rotate(180deg)";

    } else {

      resposta.style.display = "none";
      icone.style.transform = "rotate(0deg)";

    }

  });

});