// =========================================
// VERIFICA AI
// services/appwrite.js
// Serviço compartilhado de acesso ao Appwrite.
// Usado por: tela.cadastro, pagina-login, guia-rapido, dashboard-comunidade.
// =========================================

import {
  Client,
  Account,
  TablesDB,
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

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const account = new Account(client);
const tablesDB = new TablesDB(client);

// =========================================
// CONTA / SESSÃO
// =========================================

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

  await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PROFILES,
    rowId: usuario.$id,
    data: {
      userId: usuario.$id,
      name: nome,
      avatarField: "",
    },
    permissions: [
      Permission.read(Role.any()), // nome/avatar aparecem nas publicações, até pra visitantes
      Permission.update(Role.user(usuario.$id)),
      Permission.delete(Role.user(usuario.$id)),
    ],
  });

  return usuario;
}

async function fazerLogin({ email, senha }) {
  return account.createEmailPasswordSession({
    email,
    password: senha,
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

export {
  client,
  account,
  tablesDB,
  criarConta,
  fazerLogin,
  fazerLogout,
  pegarUsuarioAtual,
  pegarPerfil,
  salvarRespostaDesafio,
  pegarRespostasUsuario,
  criarPublicacao,
  listarPublicacoes,
};
