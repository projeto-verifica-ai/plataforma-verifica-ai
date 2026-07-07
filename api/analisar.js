import { analisarConteudo } from "../server/geminiService.js";

export default async function handler(req, res) {
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
