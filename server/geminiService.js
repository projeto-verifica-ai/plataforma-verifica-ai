import fetch from "node-fetch";

/* --------------------------------
   CONFIGURAÇÃO DA API
   -------------------------------- */

// Chave da API carregada do arquivo .env (para não ficar visivel a usuarios)
const API_KEY = process.env.GEMINI_API_KEY;

// Modelos gratuitos em ordem de preferência (mais recente → mais antigo).
// Se um modelo retornar 429 (limite) ou 503 (sobrecarga),
// o sistema tenta automaticamente o próximo da lista.
const MODELOS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

// URL base da API REST do Gemini
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";


/* --------------------------------
   PROMPT DE SISTEMA
   Define a personalidade, regras e formato de resposta da IA.
   -------------------------------- */
const SYSTEM_PROMPT = `Você é o verificador de conteúdo do Verifica AI, uma plataforma de letramento digital para pessoas com pouca familiaridade tecnológica, especialmente idosos. Sua missão é ajudar pessoas leigas a identificar fake news, golpes digitais e conteúdos gerados ou manipulados por inteligência artificial.

O usuário vai te enviar uma notícia, texto, link ou arquivo (foto, vídeo ou áudio). Você deve fazer DUAS análises complementares:

1. VERIFICAÇÃO DE VERACIDADE: o conteúdo é verdadeiro, falso ou inconclusivo? Pesquise na web para confirmar.
2. DETECÇÃO DE IA/MANIPULAÇÃO: o conteúdo parece ter sido gerado ou manipulado por IA, editado digitalmente ou montado?

## Análise de imagens — seja minucioso:
- Procure sinais de geração por IA: dedos e mãos com anatomia errada, texto ilegível ou sem sentido na imagem, texturas irreais na pele/cabelo, fundos borrados ou inconsistentes, objetos que se fundem de forma estranha, simetria artificial excessiva, iluminação que não bate entre elementos.
- Procure sinais de montagem/edição: bordas recortadas, diferença de resolução entre partes da imagem, sombras inconsistentes, proporções distorcidas, elementos colados sobre o fundo.
- Analise o texto sobreposto: frases sensacionalistas, fontes que imitam jornais ou órgãos oficiais, logos falsos ou adulterados, capturas de tela que podem ter sido editadas.
- Se a imagem mostra uma suposta notícia, declaração ou print de rede social, pesquise na web se aquilo realmente aconteceu.
- SEMPRE diga ao usuário se a imagem parece real, gerada por IA ou manipulada, mesmo que ele não pergunte. Isso é parte central da sua função.

## Análise de áudio e vídeo:
- Verifique sinais de deepfake: movimentos labiais fora de sincronia, voz robótica ou artificial, transições bruscas, qualidade inconsistente.
- Em áudios, note se a voz parece sintética, se há cortes estranhos ou se o tom é uniforme demais.

## Formato de resposta — preencha os campos:
- "status": "ok" para análise normal, ou "recusado" se o usuário infringir as regras abaixo.
- "veredito": "falso", "verdadeiro" ou "inconclusivo". Se status for "recusado", use "inconclusivo".
- "titulo": frase curta e direta. Ex: "Cuidado! Essa imagem foi gerada por inteligência artificial." ou "Sim, essa informação é verdadeira e a foto é real."
- "paragrafos": 1 a 2 parágrafos curtos explicando o porquê, em linguagem simples. Inclua os sinais específicos que você identificou (ex: "repare que os dedos da mão estão deformados, o que é um sinal clássico de imagem criada por IA"). Explique de forma educativa para ajudar o usuário a aprender a identificar sozinho.
- "subtitulo": OPCIONAL. Use para aprofundar, ex: "Como identificar imagens feitas por IA?" ou "Como os golpistas criam essas montagens?".
- "paragrafosFinais": OPCIONAL. Parágrafos complementares com dicas práticas para o usuário se proteger.
- "fontes": OPCIONAL. Lista de objetos { "titulo": "nome da fonte", "url": "link" }. Deixe lista vazia se não houver.

## Regras importantes:
- Nunca invente fontes, dados ou nomes que você não tenha certeza.
- Use um tom acolhedor e direto, nunca alarmista.
- Se o conteúdo for ambíguo, use "inconclusivo" em vez de arriscar.
- Sempre que possível, apresente suas fontes.
- Trate o usuário como leigo e tenha um tom educativo, ensinando a desenvolver senso crítico digital.
- Se o usuário for desrespeitoso ou fugir do objetivo da plataforma, defina status como "recusado".
- Quando o conteúdo for gerado por IA, explique de forma simples o que é IA generativa e por que ela pode ser usada para enganar.

IMPORTANTE: responda SEMPRE com um objeto JSON válido e nada mais — sem texto antes ou depois, sem markdown. Use a busca na web para fundamentar sua análise em fontes confiáveis e atuais.`;


/* ================================
   FUNÇÕES AUXILIARES
   ================================ */


/* Extrai um objeto JSON de dentro de um texto que pode vir
   cercado por crases de markdown ou texto solto. */
function extrairJson(texto) {
  const semCercas = texto.replace(/```json|```/g, "").trim();
  const inicio = semCercas.indexOf("{");
  const fim = semCercas.lastIndexOf("}");
  if (inicio === -1 || fim === -1) return null;
  try {
    return JSON.parse(semCercas.slice(inicio, fim + 1));
  } catch {
    return null;
  }
}


/* Faz a chamada HTTP para um modelo específico do Gemini. */
function chamarModelo(modelo, body) {
  const url = `${API_BASE}/${modelo}:generateContent?key=${API_KEY}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}


/* ================================
   FUNÇÃO PRINCIPAL: analisarConteudo()
   Exportada e usada pelo app.js.

   Recebe texto e/ou arquivo (base64) do frontend.
   Tenta em duas rodadas:
     1ª) Todos os modelos COM busca web (google_search) → fontes reais
     2ª) Todos os modelos SEM busca web → fallback caso a busca esteja limitada

   Dentro de cada rodada, percorre a lista MODELOS na ordem.
   Se um modelo retornar 429 ou 503, pula para o próximo.
   ================================ */
export async function analisarConteudo(texto, file = null) {

  // Verifica se a chave da API está configurada
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada no .env");
  }

  /* ---- Monta as "parts" da mensagem: texto + arquivo opcional ---- */
  const parts = [];

  if (texto) {
    parts.push({ text: texto });
  } else {
    parts.push({ text: "Analise o arquivo anexado e diga se é confiável." });
  }

  // Arquivo em base64 (imagem, áudio ou vídeo)
  if (file) {
    parts.push({
      inline_data: {
        mime_type: file.mime_type,
        data: file.data,
      },
    });
  }

  /* ---- Corpos de requisição: com e sem busca web ---- */
  // A busca web (google_search) traz fontes reais, mas tem rate limit
  // próprio mais restritivo. Por isso tentamos primeiro com, depois sem.
  const bodyComBusca = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
    tools: [{ google_search: {} }],
  };

  const bodySemBusca = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
  };

  // Ordem das tentativas: primeiro com busca, depois sem
  const tentativas = [
    { body: bodyComBusca, label: "com busca web" },
    { body: bodySemBusca, label: "sem busca web" },
  ];

  let ultimoErro;

  /* ---- Loop de tentativas (com busca → sem busca) ---- */
  for (const tentativa of tentativas) {
    console.log(`\n--- Tentando ${tentativa.label} ---`);

    /* ---- Loop de modelos (mais recente → mais antigo) ---- */
    for (let i = 0; i < MODELOS.length; i++) {
      const modelo = MODELOS[i];

      try {
        console.log(`Tentando modelo: ${modelo}...`);
        const response = await chamarModelo(modelo, tentativa.body);

        // 429 = limite atingido | 503 = modelo sobrecarregado → tenta o próximo
        if (response.status === 429 || response.status === 503) {
          ultimoErro = new Error(`Modelo ${modelo} indisponível (${response.status})`);
          console.warn(`${modelo} retornou ${response.status}. Tentando o próximo modelo...`);
          continue;
        }

        // Outros erros (400, 403, 404...) são problemas reais → lança direto
        if (!response.ok) {
          const erro = await response.text();
          throw new Error(`Erro na API (${response.status}): ${erro}`);
        }

        /* ---- Sucesso — processa a resposta ---- */
        console.log(`Modelo ${modelo} respondeu com sucesso (200) [${tentativa.label}]`);
        const data = await response.json();
        const candidate = data?.candidates?.[0];

        // Junta todas as partes de texto da resposta
        const textoResposta = (candidate?.content?.parts || [])
          .map((p) => p.text)
          .filter(Boolean)
          .join("");

        // Extrai fontes reais da web consultadas pelo Gemini (grounding)
        const fontesReais = (candidate?.groundingMetadata?.groundingChunks || [])
          .map((chunk) => chunk.web)
          .filter(Boolean)
          .map((web) => ({ titulo: web.title || web.uri, url: web.uri }));

        // Tenta extrair o JSON da resposta do modelo
        const parsed = extrairJson(textoResposta);

        // Fallback: se o modelo não retornou JSON válido, monta resposta manual
        if (!parsed) {
          return {
            status: "ok",
            veredito: "inconclusivo",
            titulo: "Não consegui analisar com precisão.",
            paragrafos: [textoResposta || "Tente reformular sua pergunta."],
            subtitulo: "",
            paragrafosFinais: [],
            fontes: fontesReais,
            modelo,
          };
        }

        /* ---- Normalização dos campos ---- */
        // Garante que o veredito esteja sempre em minúsculo (evita "FALSO", "Falso")
        parsed.veredito = (parsed.veredito || "inconclusivo").toLowerCase().trim();
        parsed.status = parsed.status || "ok";

        // Garante que parágrafos sejam arrays (o Gemini às vezes retorna string)
        parsed.paragrafos = Array.isArray(parsed.paragrafos) ? parsed.paragrafos : [parsed.paragrafos].filter(Boolean);
        parsed.paragrafosFinais = Array.isArray(parsed.paragrafosFinais) ? parsed.paragrafosFinais : [parsed.paragrafosFinais].filter(Boolean);

        // Prioriza fontes reais do grounding; usa as citadas pelo modelo como fallback
        parsed.fontes = fontesReais.length ? fontesReais : (parsed.fontes || []);

        // Adiciona qual modelo foi usado (debug)
        parsed.modelo = modelo;

        return parsed;

      } catch (erro) {
        ultimoErro = erro;
        console.warn(`Falha no modelo ${modelo}:`, erro.message);
      }
    }
  }

  // Se chegou aqui, todos os modelos falharam nas duas rodadas
  throw ultimoErro || new Error("Todos os modelos estão indisponíveis no momento.");
}
