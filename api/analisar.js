import { analisarConteudo } from "../server/geminiService.js";

export default async function handler(req, res) {

  /* --------------------------------
     CORS — precisa vir primeiro,
     antes de qualquer verificação de método
     -------------------------------- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde o preflight do navegador e encerra
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
}