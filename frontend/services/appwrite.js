// =========================================
// VERIFICA AI
// services/appwrite.js
// Serviço compartilhado de acesso ao Appwrite.
// Usado por: tela-cadastro, pagina-login, guia-rapido, dashboard-comunidade.
// =========================================

import {
  Client,
  Account,
  TablesDB,
  Storage,
  ID,
  Query,
  Permission,
  Role,
} from "https://cdn.jsdelivr.net/npm/appwrite@26/+esm";

// ===============================
// CONFIGURAÇÃO — preencha com os dados do seu projeto Appwrite
// (Console → Overview → API Endpoint / Project ID)
// ===============================

const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT = "6a455a5200116f16940c";

// IDs reais criados no console (Database "VerificaAI-Database")
const DATABASE_ID = "6a67ebe8002b33a1228a";
const TABLE_PROFILES = "profiles";
const TABLE_CHALLENGES_SAVE = "challanges-save";
const TABLE_COMMUNITY = "community";
const TABLE_NOTICIAS = "noticias";

// Bucket de Storage pras fotos de perfil ("Imagens de perfil" no console)
const STORAGE_AVATARS = "6a455a850023c7385fe9";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const account = new Account(client);
const tablesDB = new TablesDB(client);
const storage = new Storage(client);

// =========================================
// CONTA / SESSÃO
// =========================================

// Cria a linha em "profiles" pro usuário, caso ainda não exista.
// Usado tanto no cadastro normal (email/senha) quanto no primeiro
// login via Facebook/Google — o Appwrite cria a conta no Auth
// automaticamente no OAuth, mas ninguém cria a linha de perfil pra
// gente, então isso precisa ser feito manualmente na primeira vez.
async function garantirPerfil(usuario) {
  const existente = await pegarPerfil(usuario.$id);
  if (existente) return existente;

  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PROFILES,
    rowId: usuario.$id,
    data: {
      userId: usuario.$id,
      name: usuario.name || usuario.email,
      avatarField: "",
    },
    permissions: [
      Permission.read(Role.any()), // nome/avatar aparecem nas publicações, até pra visitantes
      Permission.update(Role.user(usuario.$id)),
      Permission.delete(Role.user(usuario.$id)),
    ],
  });
}

// Cria a conta no Auth do Appwrite, já loga e cria a linha em "profiles"
async function criarConta({ nome, email, senha }) {
  await account.create({
    userId: ID.unique(),
    email,
    password: senha,
    name: nome,
  });

  await fazerLogin({ email, senha });

  const usuario = await account.get();

  await garantirPerfil(usuario);

  return usuario;
}

async function fazerLogin({ email, senha }) {
  return account.createEmailPasswordSession({
    email,
    password: senha,
  });
}

// Login/cadastro via Facebook ou Google. Redireciona o navegador pro
// provedor escolhido — não dá pra usar await normal aqui, porque a
// página inteira navega pra fora e volta em "sucesso"/"falha".
// provider: "facebook" ou "google".
function loginComOAuth(provider, { sucesso, falha, scopes } = {}) {
  const origem = window.location.origin;

  // O Facebook, por padrão, rejeita o escopo "email" com o erro
  // "Invalid Scopes: email" a não ser que o app esteja configurado
  // como "Facebook Login" clássico (não "for Business") — pra não
  // depender dessa configuração, pede só o perfil público por padrão.
  // O Appwrite cria a conta normalmente mesmo sem o e-mail do Facebook.
  const escopos = scopes || (provider === "facebook" ? ["public_profile"] : undefined);

  account.createOAuth2Session({
    provider,
    success: sucesso || `${origem}/Pages/dashboard-principal/dashboard-principal.html`,
    failure: falha || window.location.href,
    ...(escopos ? { scopes: escopos } : {}),
  });
}

async function fazerLogout() {
  return account.deleteSession({ sessionId: "current" });
}

// Retorna o usuário logado, ou null se ninguém estiver logado
async function pegarUsuarioAtual() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// =========================================
// PERFIL (tabela "profiles")
// =========================================

async function pegarPerfil(userId) {
  const resultado = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PROFILES,
    queries: [Query.equal("userId", userId), Query.limit(1)],
  });

  return resultado.rows[0] ?? null;
}

// Monta a URL pra exibir o arquivo do avatar salvo no Storage.
// Usa getFileView (não getFilePreview/miniatura) porque transformação de
// imagem é um recurso pago do Appwrite Cloud — no plano gratuito ele
// responde 403 "storage_image_transformations_blocked". Por isso o
// próprio arquivo já é comprimido pro tamanho certo ANTES do upload,
// em trocarAvatar() — ver comprimirImagem() logo abaixo.
// Retorna null se o usuário ainda não tem foto (avatarField vazio).
function pegarUrlAvatar(fileId) {
  if (!fileId) return null;
  return storage.getFileView({ bucketId: STORAGE_AVATARS, fileId }).toString();
}

// Redimensiona/comprime a imagem no navegador antes do upload, pra não
// depender de transformação de imagem no servidor (recurso pago do
// Appwrite Cloud). Evita fotos de câmera de vários MB virarem o arquivo
// "original" que todo mundo baixa pra ver um círculo de 44px.
async function comprimirImagem(arquivo, tamanhoMax = 256, qualidade = 0.82) {
  const bitmap = await createImageBitmap(arquivo);

  const escala = Math.min(1, tamanhoMax / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, largura, altura);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", qualidade)
  );

  // Se por algum motivo a compressão falhar, envia o arquivo original
  // em vez de travar o fluxo de troca de avatar.
  if (!blob) return arquivo;

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

// Envia a nova foto pro Storage e salva o id dela em profiles.avatarField.
// Se o usuário já tinha uma foto antes, apaga a antiga do Storage depois
// de confirmar que a nova já está salva no perfil (senão, se o upload da
// nova falhar, a pessoa ficaria sem nenhuma foto).
async function trocarAvatar(userId, arquivo) {
  const perfilAtual = await pegarPerfil(userId);
  const avatarAntigoId = perfilAtual?.avatarField || null;

  let arquivoComprimido = arquivo;
  try {
    arquivoComprimido = await comprimirImagem(arquivo);
  } catch (erro) {
    // Segue com o arquivo original — melhor um avatar pesado do que
    // travar a troca de foto por completo.
    console.error("Não foi possível comprimir a imagem, enviando original:", erro);
  }

  const arquivoEnviado = await storage.createFile({
    bucketId: STORAGE_AVATARS,
    fileId: ID.unique(),
    file: arquivoComprimido,
    permissions: [
      Permission.read(Role.any()),
      Permission.delete(Role.user(userId)),
    ],
  });

  // rowId de "profiles" é sempre igual ao userId (definido em criarConta),
  // então dá pra atualizar direto sem precisar buscar a linha antes.
  await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PROFILES,
    rowId: userId,
    data: { avatarField: arquivoEnviado.$id },
  });

  if (avatarAntigoId && avatarAntigoId !== arquivoEnviado.$id) {
    try {
      await storage.deleteFile({ bucketId: STORAGE_AVATARS, fileId: avatarAntigoId });
    } catch (erro) {
      // Não interrompe o fluxo — a foto nova já está salva e é o que importa.
      // Provável causa: bucket sem permissão de "Delete" pra Users.
      console.error("Não foi possível apagar a foto antiga do Storage:", erro);
    }
  }

  return pegarUrlAvatar(arquivoEnviado.$id);
}

// =========================================
// GUIA RÁPIDO (tabela "challanges-save")
// =========================================

// Salva (ou atualiza) a resposta de um desafio para o usuário logado
async function salvarRespostaDesafio({ userId, trailId, challangeId, optionId, correct }) {
  const existente = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_CHALLENGES_SAVE,
    queries: [
      Query.equal("userId", userId),
      Query.equal("challangeId", challangeId),
      Query.limit(1),
    ],
  });

  const dados = { userId, trailId, challangeId, optionId, correct };

  if (existente.rows[0]) {
    return tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_CHALLENGES_SAVE,
      rowId: existente.rows[0].$id,
      data: dados,
    });
  }

  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_CHALLENGES_SAVE,
    rowId: ID.unique(),
    data: dados,
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
}

// Todas as respostas já salvas do usuário (usado pra reidratar as trilhas)
async function pegarRespostasUsuario(userId) {
  const resultado = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_CHALLENGES_SAVE,
    queries: [Query.equal("userId", userId), Query.limit(500)],
  });

  return resultado.rows;
}

// =========================================
// COMUNIDADE (tabela "community")
// =========================================

async function criarPublicacao({ userId, text, link }) {
  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_COMMUNITY,
    rowId: ID.unique(),
    data: { userId, text, link: link || null },
    permissions: [
      Permission.read(Role.any()), // feed é público, até pra visitantes sem login
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
}

// Publicações mais recentes primeiro
async function listarPublicacoes() {
  const resultado = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_COMMUNITY,
    queries: [Query.orderDesc("$createdAt"), Query.limit(50)],
  });

  return resultado.rows;
}

// =========================================
// NOTÍCIAS (tabela "noticias")
// =========================================

// Mais recentes primeiro. Sem filtro/paginação aqui — isso é feito no
// cliente (tela-noticias.js), já que o volume de notícias é pequeno.
async function listarNoticias() {
  const resultado = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_NOTICIAS,
    queries: [Query.orderDesc("data"), Query.limit(500)],
  });

  return resultado.rows;
}

// Só deve ser chamada depois de confirmar perfil.isModerator — a permissão
// de "create" na tabela também precisa estar liberada pra usuários logados
// no console do Appwrite, senão isso falha mesmo vindo de um moderador.
async function criarNoticia({ categoria, texto, imagem, link, data, autorId }) {
  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_NOTICIAS,
    rowId: ID.unique(),
    data: { categoria, texto, imagem, link: link || null, data, autorId },
    permissions: [
      Permission.read(Role.any()), // notícias são públicas, até pra visitante
      Permission.update(Role.user(autorId)),
      Permission.delete(Role.user(autorId)),
    ],
  });
}

// Só quem criou a notícia tem permissão de editar/apagar (mesma regra
// de "autorId" definida em criarNoticia acima).
async function atualizarNoticia(id, { categoria, texto, imagem, link }) {
  return tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_NOTICIAS,
    rowId: id,
    data: { categoria, texto, imagem, link: link || null },
  });
}

async function excluirNoticia(id) {
  return tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_NOTICIAS,
    rowId: id,
  });
}

export {
  client,
  account,
  tablesDB,
  criarConta,
  fazerLogin,
  loginComOAuth,
  garantirPerfil,
  fazerLogout,
  pegarUsuarioAtual,
  pegarPerfil,
  pegarUrlAvatar,
  trocarAvatar,
  salvarRespostaDesafio,
  pegarRespostasUsuario,
  criarPublicacao,
  listarPublicacoes,
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  excluirNoticia,
};
