// Configuração da API Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Instrução de sistema que dá personalidade e foco ao assistente
const SYSTEM_PROMPT = `Você é o verificador de conteúdo do Verifica AI, uma plataforma de letramento digital para pessoas com pouca familiaridade tecnológica, especialmente idosos.

O usuário vai te enviar uma notícia, texto, link ou arquivo (foto, vídeo ou áudio). Analise e responda preenchendo os campos do schema:

- "titulo": uma frase curta e direta dizendo se é falso, verdadeiro ou inconclusivo. Exemplo: "Não, essa notícia é totalmente falsa! É mais um golpe na internet." ou "Sim, essa informação é verdadeira."
- "paragrafos": 1 a 2 parágrafos curtos explicando o porquê, em linguagem simples, sem termos técnicos.
- "subtitulo": OPCIONAL. Só preencha se fizer sentido explicar algo a mais, como "Como os golpistas fazem isso?". Deixe em branco se não precisar.
- "paragrafosFinais": OPCIONAL. Parágrafos complementares relacionados ao subtítulo.

Regras importantes:
- Nunca invente fontes, dados ou nomes que você não tenha certeza.
- Use um tom acolhedor e direto, nunca alarmista.
- Se o conteúdo for ambíguo, diga isso claramente no título em vez de arriscar um veredito.`;

/**
 * Converte um arquivo (imagem/áudio/vídeo) em base64 para envio à API.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Envia a mensagem (texto e/ou arquivo) para o Gemini e retorna
 * um objeto já no formato esperado pelo chatbot.
 */
export async function analisarConteudo(texto, file = null) {
  // Monta as "parts" da mensagem: texto + arquivo opcional
  const parts = [];

  if (texto) {
    parts.push({ text: texto });
  } else {
    parts.push({ text: "Analise o arquivo anexado e diga se é confiável." });
  }

  if (file) {
    const base64Data = await fileToBase64(file);
    parts.push({
      inline_data: {
        mime_type: file.type,
        data: base64Data,
      },
    });
  }

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro na API (${response.status}): ${erro}`);
  }

  const data = await response.json();

  // Extrai o texto retornado pelo modelo
  const textoResposta =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Como pedimos JSON, fazemos o parse — com fallback de segurança
  try {
    return JSON.parse(textoResposta);
  } catch {
    return {
      titulo: "Não consegui analisar com precisão.",
      paragrafos: [textoResposta || "Tente reformular sua pergunta."],
      subtitulo: "",
      paragrafosFinais: [],
    };
  }
}