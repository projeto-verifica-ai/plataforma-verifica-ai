// =========================================
// VERIFICA AI
// config.js
// Configuração dos elementos da página
// =========================================

const formulario = document.getElementById("cadastro");

// ==============================
// Campos
// ==============================

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

// ==============================
// Barra de força da senha
// ==============================

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

// ==============================
// Mensagens de erro
// ==============================

const erroNome = document.getElementById("erroNome");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmar = document.getElementById("erroConfirmar");

// ==============================
// Termos de uso
// ==============================

const checkbox = document.getElementById("aceito");

// ==============================
// Botão Criar Conta
// ==============================

const btnCriarConta = document.querySelector(".create-account");

// ==============================
// Ícones dos olhos
// ==============================

const olhoSenha = document.querySelector(".password i");
const olhoConfirmar = document.getElementById("olhoConfirmar");

// ==============================
// Modal
// ==============================

const modal = document.getElementById("modal");
const abrirTermos = document.getElementById("abrirTermos");
const fechar = document.getElementById("fechar");
const cancelar = document.getElementById("cancelar");
const aceitar = document.getElementById("aceitar");

const modalBody = document.getElementById("modalBody");
const scrollInfo = document.getElementById("scrollInfo");

// ==============================
// Toast
// ==============================

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");