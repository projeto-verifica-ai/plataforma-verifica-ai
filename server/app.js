/* ============================================================
   APP.JS — Servidor Express do Verifica AI
   Ponto de entrada do backend.
   Recebe requisições do frontend e repassa para o geminiService.
   A API key do Gemini fica protegida aqui no servidor.
   ============================================================ */


/* --------------------------------
   IMPORTS E CONFIGURAÇÃO
   -------------------------------- */
import "dotenv/config";                              // Carrega variáveis do .env (ex: GEMINI_API_KEY)
import express from "express";
import cors from "cors";
import { analisarConteudo } from "./geminiService.js";

const app = express();
const PORT = process.env.PORT || 3000;


/* --------------------------------
   MIDDLEWARES
   -------------------------------- */
app.use(cors());                                     // Permite requisições do frontend (origens diferentes)
app.use(express.json({ limit: "20mb" }));            // Aceita JSON grande (arquivos em base64)


/* --------------------------------
   ROTA PRINCIPAL: POST /api/analisar
   Recebe texto e/ou arquivo do frontend, envia ao Gemini e retorna a análise.
   -------------------------------- */
app.post("/api/analisar", async (req, res) => {
  try {
    const { texto, file } = req.body;

    // Valida que pelo menos um conteúdo foi enviado
    if (!texto && !file) {
      return res.status(400).json({ error: "Envie um texto ou arquivo." });
    }

    // Chama o serviço que se comunica com a API do Gemini
    const resultado = await analisarConteudo(texto, file);
    res.json(resultado);

  } catch (erro) {
    // Se todos os modelos falharem, retorna resposta amigável ao frontend
    console.error("Erro na análise:", erro.message);
    res.status(502).json({
      status: "ok",
      veredito: "inconclusivo",
      titulo: "Ops, algo deu errado.",
      paragrafos: ["Não consegui me conectar agora. Tente novamente em instantes."],
      subtitulo: "",
      paragrafosFinais: [],
      fontes: [],
    });
  }
});


/* --------------------------------
   INICIALIZAÇÃO DO SERVIDOR
   -------------------------------- */
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
