import { analisarConteudo } from "../server/geminiService.js";

// Função utilitária para aplicar os cabeçalhos de CORS
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Você pode trocar o "*" pela URL do seu frontend por segurança
  res.setHeader("Access-Control-Allow-Origin", "https://plataforma-verifica-ai.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
}

export default async function handler(req, res) {
  // 1. Aplica os cabeçalhos em todas as requisições
  setCorsHeaders(res);

  // 2. O navegador faz uma requisição OPTIONS antes do POST para verificar o CORS.
  // Devemos responder com sucesso (200) imediatamente.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3. Continua apenas se for POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { texto, file } = req.body || {};

  if (!texto && !file) {
    return res.status(400).json({ error: "Envie um texto ou arquivo." });
  }

  try {
    const resultado = await analisarConteudo(texto, file);
    res.json(resultado);
  } catch (erro) {
    res.status(502).json({
      status: "ok",
      veredito: "inconclusivo",
      titulo: "Ops, algo deu errado.",
      paragrafos: ["Não consegui me conectar agora. Tente novamente."],
      subtitulo: "",
      paragrafosFinais: [],
      fontes: [],
    });
  }
}