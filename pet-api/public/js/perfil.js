import { requisitarJson } from "./api.js";
import { atualizarTextoSobre } from "./interface.js";

const modalEndereco = document.getElementById("modal-endereco");
const formularioEndereco = document.getElementById("form-endereco");
const cepEndereco = document.getElementById("cep-endereco");
const botaoBuscarCep = document.getElementById("buscar-cep");
const botaoBuscarCepEndereco = document.getElementById("buscar-cep-endereco");
const cepsEncontrados = document.getElementById("ceps-encontrados");
const rotuloCepsEncontrados = document.getElementById("rotulo-ceps-encontrados");
const botaoSalvarEndereco = document.getElementById("salvar-endereco");
const statusEndereco = document.getElementById("status-endereco");
const enderecoVisivel = document.getElementById("cep-salvo");
const linkPesquisaGoogle = document.getElementById("pesquisar-instituicao-google");
const ajudaPesquisaInstituicao = document.getElementById("ajuda-pesquisa-instituicao");
const modalRedeSocial = document.getElementById("modal-rede-social");
const formularioRedeSocial = document.getElementById("form-rede-social");
const tituloModalRedeSocial = document.getElementById("titulo-modal-rede-social");
const nomeRedeSocial = document.getElementById("nome-rede-social");
const urlRedeSocial = document.getElementById("url-rede-social");
const erroRedeSocial = document.getElementById("erro-rede-social");
const botaoSalvarRedeSocial = document.getElementById("salvar-rede-social");
const modalEmailPerfil = document.getElementById("modal-email-perfil");
const formularioEmailPerfil = document.getElementById("form-email-perfil");
const entradaEmailPerfil = document.getElementById("email-perfil");
const erroEmailPerfil = document.getElementById("erro-email-perfil");
const botaoSalvarEmailPerfil = document.getElementById("salvar-email-perfil");
const modalEnvioEmail = document.getElementById("modal-envio-email");
const formularioEnvioEmail = document.getElementById("form-envio-email");
const destinatarioEmail = document.getElementById("destinatario-email");
const assuntoEmail = document.getElementById("assunto-email");
const mensagemEmail = document.getElementById("mensagem-email");
const statusEnvioEmail = document.getElementById("status-envio-email");
const botaoEnviarEmail = document.getElementById("enviar-email");

let perfilAtual = null;
let enderecoConsultado = null;
let resultadosBuscaCep = [];
let editorAtivo = null;
let redeSocialAtiva = null;

function emailValido(email) {
  return typeof email === "string" && email.length <= 254
    && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

const redesSociaisPadrao = {
  github: { nome: "GitHub", url: "https://github.com/" },
  instagram: { nome: "Instagram", url: "https://www.instagram.com/" },
  linkedin: { nome: "LinkedIn", url: "https://www.linkedin.com/" }
};

function atualizarBuscaInstituicaoGoogle(nomeInstituicao) {
  const consulta = `${nomeInstituicao.trim()} endereço site portal oficial`;
  linkPesquisaGoogle.href = `https://www.google.com/search?q=${encodeURIComponent(consulta)}`;
}

const editoresPerfil = [
  {
    campo: "nome",
    textoPadrao: "Insira seu nome",
    valor: document.getElementById("nome-perfil"),
    entrada: document.getElementById("campo-nome-perfil"),
    botaoSalvar: document.getElementById("salvar-nome-perfil"),
    erro: document.getElementById("erro-nome-perfil")
  },
  {
    campo: "curso",
    textoPadrao: "Insira seu Curso",
    valor: document.getElementById("curso-perfil"),
    entrada: document.getElementById("campo-curso-perfil"),
    botaoSalvar: document.getElementById("salvar-curso-perfil"),
    erro: document.getElementById("erro-curso-perfil")
  },
  {
    campo: "instituicao",
    textoPadrao: "Insira sua Instituição",
    valor: document.getElementById("instituicao-perfil"),
    entrada: document.getElementById("campo-instituicao-perfil"),
    botaoSalvar: document.getElementById("salvar-instituicao-perfil"),
    erro: document.getElementById("erro-instituicao-perfil")
  }
];

function normalizarPerfil(perfilRecebido, perfilAnterior = {}) {
  const perfilNormalizado = { ...perfilAnterior, ...perfilRecebido };
  for (const editor of editoresPerfil) {
    if (typeof perfilNormalizado[editor.campo] !== "string"
      || !perfilNormalizado[editor.campo].trim()) {
      perfilNormalizado[editor.campo] = editor.textoPadrao;
    }
  }
  perfilNormalizado.email = emailValido(perfilNormalizado.email)
    ? perfilNormalizado.email.trim()
    : "";
  perfilNormalizado.redesSociais = Object.fromEntries(
    Object.entries(redesSociaisPadrao).map(([chave, padrao]) => {
      const rede = perfilNormalizado.redesSociais?.[chave];
      let urlValidada;
      try {
        urlValidada = new URL(rede?.url);
      } catch {
        urlValidada = null;
      }

      return [
        chave,
        typeof rede?.nome === "string" && rede.nome.trim().length <= 40
          && rede.nome.trim() && urlValidada
          && ["http:", "https:"].includes(urlValidada.protocol)
          ? { nome: rede.nome.trim(), url: urlValidada.href }
          : padrao
      ];
    })
  );
  return perfilNormalizado;
}

function atualizarBotoesRedesSociais(redesSociais) {
  for (const [chave, rede] of Object.entries(redesSociais)) {
    const link = document.getElementById(`link-${chave}`);
    if (!link || typeof rede.nome !== "string" || typeof rede.url !== "string") {
      continue;
    }

    link.textContent = rede.nome;
    link.href = rede.url;
  }
}

async function abrirEditorRedeSocial(chave) {
  redeSocialAtiva = chave;
  erroRedeSocial.hidden = true;
  erroRedeSocial.textContent = "";

  try {
    if (!perfilAtual) {
      perfilAtual = normalizarPerfil(await requisitarJson("/api/perfil"));
    }

    const rede = perfilAtual.redesSociais[chave];
    tituloModalRedeSocial.textContent = `Editar botão ${rede.nome}`;
    nomeRedeSocial.value = rede.nome;
    urlRedeSocial.value = rede.url;
    modalRedeSocial.showModal();
    nomeRedeSocial.focus();
    nomeRedeSocial.select();
  } catch (erro) {
    console.error("Erro ao carregar rede social para edição:", erro);
    erroRedeSocial.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar os dados do botão.";
    erroRedeSocial.hidden = false;
    modalRedeSocial.showModal();
  }
}

async function salvarRedeSocial(evento) {
  evento.preventDefault();
  erroRedeSocial.hidden = true;
  erroRedeSocial.textContent = "";

  const nome = nomeRedeSocial.value.trim();
  const url = urlRedeSocial.value.trim();
  let urlValidada;
  try {
    urlValidada = new URL(url);
  } catch {
    urlValidada = null;
  }

  if (!nome || nome.length > 40) {
    erroRedeSocial.textContent = "Informe um nome com até 40 caracteres.";
    erroRedeSocial.hidden = false;
    nomeRedeSocial.focus();
    return;
  }
  if (!urlValidada || !["http:", "https:"].includes(urlValidada.protocol)
    || url.length > 2048) {
    erroRedeSocial.textContent = "Informe um link válido iniciado por http:// ou https://.";
    erroRedeSocial.hidden = false;
    urlRedeSocial.focus();
    return;
  }

  botaoSalvarRedeSocial.disabled = true;
  try {
    const perfilSalvo = await requisitarJson("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...perfilAtual,
        redesSociais: {
          ...perfilAtual.redesSociais,
          [redeSocialAtiva]: { nome, url }
        }
      })
    });
    const redeSalva = perfilSalvo.redesSociais?.[redeSocialAtiva];
    if (redeSalva?.nome !== nome || typeof redeSalva.url !== "string"
      || new URL(redeSalva.url).href !== urlValidada.href) {
      throw new Error(
        "A API não confirmou a alteração. Reinicie o servidor e tente novamente."
      );
    }

    perfilAtual = normalizarPerfil(perfilSalvo);
    atualizarBotoesRedesSociais(perfilAtual.redesSociais);
    modalRedeSocial.close();
  } catch (erro) {
    console.error("Erro ao salvar rede social:", erro);
    erroRedeSocial.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar as alterações do botão.";
    erroRedeSocial.hidden = false;
  } finally {
    botaoSalvarRedeSocial.disabled = false;
  }
}

export function inicializarEdicaoRedesSociais() {
  document.querySelectorAll(".editar-rede-social[data-rede-social]").forEach((botao) => {
    botao.addEventListener("click", () => {
      void abrirEditorRedeSocial(botao.dataset.redeSocial);
    });
  });

  document.getElementById("fechar-modal-rede-social")
    .addEventListener("click", () => modalRedeSocial.close());
  document.getElementById("cancelar-rede-social")
    .addEventListener("click", () => modalRedeSocial.close());
  formularioRedeSocial.addEventListener("submit", salvarRedeSocial);
  modalRedeSocial.addEventListener("click", (evento) => {
    if (evento.target === modalRedeSocial) {
      modalRedeSocial.close();
    }
  });
}

async function carregarPerfilParaContato() {
  perfilAtual = normalizarPerfil(await requisitarJson("/api/perfil"), perfilAtual || {});
  return perfilAtual;
}

async function abrirEditorEmailPerfil() {
  erroEmailPerfil.hidden = true;
  erroEmailPerfil.textContent = "";
  botaoSalvarEmailPerfil.disabled = false;

  try {
    await carregarPerfilParaContato();
    entradaEmailPerfil.value = perfilAtual.email;
  } catch (erro) {
    console.error("Erro ao carregar email do perfil:", erro);
    erroEmailPerfil.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar o email do perfil.";
    erroEmailPerfil.hidden = false;
  }

  modalEmailPerfil.showModal();
  entradaEmailPerfil.focus();
}

async function salvarEmailPerfil(evento) {
  evento.preventDefault();
  erroEmailPerfil.hidden = true;
  erroEmailPerfil.textContent = "";
  const email = entradaEmailPerfil.value.trim();

  if (!emailValido(email)) {
    erroEmailPerfil.textContent = "Informe um endereço de email válido.";
    erroEmailPerfil.hidden = false;
    entradaEmailPerfil.focus();
    return;
  }

  botaoSalvarEmailPerfil.disabled = true;
  try {
    const perfilSalvo = await requisitarJson("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...perfilAtual, email })
    });
    perfilAtual = normalizarPerfil(perfilSalvo);
    modalEmailPerfil.close();
  } catch (erro) {
    console.error("Erro ao salvar email do perfil:", erro);
    erroEmailPerfil.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar o email do perfil.";
    erroEmailPerfil.hidden = false;
  } finally {
    botaoSalvarEmailPerfil.disabled = false;
  }
}

function atualizarStatusEnvioEmail(mensagem, erro = false) {
  statusEnvioEmail.textContent = mensagem;
  statusEnvioEmail.hidden = !mensagem;
  statusEnvioEmail.classList.toggle("erro-perfil", erro);
  statusEnvioEmail.classList.toggle("status-envio-email-info", Boolean(mensagem) && !erro);
}

async function abrirFormularioEnvioEmail() {
  atualizarStatusEnvioEmail("");
  formularioEnvioEmail.reset();
  botaoEnviarEmail.disabled = true;
  destinatarioEmail.textContent = "";
  modalEnvioEmail.showModal();

  try {
    await carregarPerfilParaContato();
    if (!perfilAtual.email) {
      atualizarStatusEnvioEmail(
        "Cadastre um email válido do perfil antes de enviar.",
        true
      );
      return;
    }

    destinatarioEmail.textContent = perfilAtual.email;
    botaoEnviarEmail.disabled = false;
    assuntoEmail.focus();
  } catch (erro) {
    console.error("Erro ao carregar destinatário do email:", erro);
    atualizarStatusEnvioEmail(
      erro instanceof Error
        ? erro.message
        : "Não foi possível carregar o destinatário do email.",
      true
    );
  }
}

function enviarEmailPeloAplicativoPadrao(evento) {
  evento.preventDefault();
  atualizarStatusEnvioEmail("");

  const assunto = assuntoEmail.value.trim();
  const mensagem = mensagemEmail.value.trim();
  if (!perfilAtual || !emailValido(perfilAtual.email)) {
    atualizarStatusEnvioEmail(
      "Cadastre um email válido do perfil antes de enviar.",
      true
    );
    return;
  }
  if (!assunto || !mensagem) {
    atualizarStatusEnvioEmail("Preencha o assunto e a mensagem.", true);
    return;
  }

  const parametros = new URLSearchParams({ subject: assunto, body: mensagem });
  const destinatario = encodeURIComponent(perfilAtual.email).replace(/%40/i, "@");
  window.location.href = `mailto:${destinatario}?${parametros.toString()}`;
  atualizarStatusEnvioEmail(
    "O aplicativo de email será aberto para você revisar e confirmar o envio."
  );
}

export function inicializarContatoPerfil() {
  document.getElementById("abrir-modal-email-perfil")
    .addEventListener("click", () => void abrirEditorEmailPerfil());
  document.getElementById("fechar-modal-email-perfil")
    .addEventListener("click", () => modalEmailPerfil.close());
  document.getElementById("cancelar-email-perfil")
    .addEventListener("click", () => modalEmailPerfil.close());
  formularioEmailPerfil.addEventListener("submit", salvarEmailPerfil);
  modalEmailPerfil.addEventListener("click", (evento) => {
    if (evento.target === modalEmailPerfil) {
      modalEmailPerfil.close();
    }
  });

  document.getElementById("abrir-modal-envio-email")
    .addEventListener("click", () => void abrirFormularioEnvioEmail());
  document.getElementById("fechar-modal-envio-email")
    .addEventListener("click", () => modalEnvioEmail.close());
  document.getElementById("cancelar-envio-email")
    .addEventListener("click", () => modalEnvioEmail.close());
  formularioEnvioEmail.addEventListener("submit", enviarEmailPeloAplicativoPadrao);
  modalEnvioEmail.addEventListener("click", (evento) => {
    if (evento.target === modalEnvioEmail) {
      modalEnvioEmail.close();
    }
  });
}

function iniciarEdicaoPerfil(editor) {
  if (!perfilAtual || (editorAtivo && editorAtivo !== editor)) {
    return;
  }

  editorAtivo = editor;
  editor.entrada.value = perfilAtual[editor.campo];
  editor.erro.hidden = true;
  editor.erro.textContent = "";
  editor.valor.hidden = true;
  editor.entrada.hidden = false;
  editor.botaoSalvar.hidden = false;
  if (editor.campo === "instituicao") {
    linkPesquisaGoogle.hidden = false;
    ajudaPesquisaInstituicao.hidden = false;
    atualizarBuscaInstituicaoGoogle(editor.entrada.value);
  }
  editor.entrada.focus();
  editor.entrada.select();
}

async function salvarEdicaoPerfil(editor) {
  const valor = editor.entrada.value.trim();
  editor.erro.hidden = true;
  editor.erro.textContent = "";

  if (!valor) {
    editor.erro.textContent = `O campo ${editor.campo} é obrigatório.`;
    editor.erro.hidden = false;
    editor.entrada.focus();
    return;
  }

  editor.entrada.disabled = true;
  editor.botaoSalvar.disabled = true;
  try {
    const perfilSalvo = await requisitarJson("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...perfilAtual,
        [editor.campo]: valor
      })
    });
    perfilAtual = normalizarPerfil(perfilSalvo, {
      ...perfilAtual,
      [editor.campo]: valor
    });

    editor.valor.textContent = perfilAtual[editor.campo];
    editor.valor.hidden = false;
    editor.entrada.hidden = true;
    editor.botaoSalvar.hidden = true;
    editorAtivo = null;
    if (editor.campo === "instituicao") {
      linkPesquisaGoogle.hidden = true;
      ajudaPesquisaInstituicao.hidden = true;
    }
  } catch (erro) {
    console.error(`Erro ao salvar ${editor.campo} do perfil:`, erro);
    editor.erro.textContent = erro instanceof Error
      ? erro.message
      : `Não foi possível salvar ${editor.campo}.`;
    editor.erro.hidden = false;
  } finally {
    editor.entrada.disabled = false;
    editor.botaoSalvar.disabled = false;
  }
}

export function inicializarEdicaoPerfil() {
  for (const editor of editoresPerfil) {
    editor.valor.addEventListener("click", () => iniciarEdicaoPerfil(editor));
    editor.valor.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        iniciarEdicaoPerfil(editor);
      }
    });
    editor.botaoSalvar.addEventListener("click", () => salvarEdicaoPerfil(editor));
    if (editor.campo === "instituicao") {
      editor.entrada.addEventListener("input", () => {
        atualizarBuscaInstituicaoGoogle(editor.entrada.value);
      });
    }
  }
}

function atualizarEnderecoVisivel(perfil) {
  const endereco = perfil?.endereco;
  const camposEndereco = [
    [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", "),
    [endereco?.complemento, endereco?.bairro].filter(Boolean).join(" - "),
    [endereco?.localidade, endereco?.uf].filter(Boolean).join(" - "),
    endereco?.cep ? `CEP: ${endereco.cep}` : ""
  ].filter(Boolean);

  const possuiEndereco = camposEndereco.length > 0;
  enderecoVisivel.hidden = !possuiEndereco;
  enderecoVisivel.textContent = camposEndereco.join(", ");
  document.getElementById("abrir-modal-endereco").hidden = possuiEndereco;
}

function preencherFormularioEndereco(endereco) {
  formularioEndereco.elements.cep.value = endereco?.cep || "";
  formularioEndereco.elements.logradouro.value = endereco?.logradouro || "";
  formularioEndereco.elements.numero.value = endereco?.numero || "";
  formularioEndereco.elements.complemento.value = endereco?.complemento || "";
  formularioEndereco.elements.bairro.value = endereco?.bairro || "";
  formularioEndereco.elements.localidade.value = endereco?.localidade || "";
  formularioEndereco.elements.uf.value = endereco?.uf || "";

  atualizarEnderecoConsultado();
}

function atualizarEnderecoConsultado() {
  const cepDigitado = cepEndereco.value.trim();
  const cep = cepDigitado.replace(/\D/g, "");
  const logradouro = formularioEndereco.elements.logradouro.value.trim();
  const bairro = formularioEndereco.elements.bairro.value.trim();
  const localidade = formularioEndereco.elements.localidade.value.trim();
  const uf = formularioEndereco.elements.uf.value.trim();

  enderecoConsultado = /^\d{5}-?\d{3}$/.test(cepDigitado)
    && cep.length === 8 && logradouro && bairro && localidade
    && /^[a-z]{2}$/i.test(uf)
    ? {
      cep: `${cep.slice(0, 5)}-${cep.slice(5)}`,
      logradouro,
      numero: formularioEndereco.elements.numero.value.trim(),
      complemento: formularioEndereco.elements.complemento.value.trim(),
      bairro,
      localidade,
      uf: uf.toUpperCase()
    }
    : null;
  botaoSalvarEndereco.disabled = !perfilAtual || !enderecoConsultado;
}

function limparResultadosBuscaCep() {
  resultadosBuscaCep = [];
  cepsEncontrados.replaceChildren();
  cepsEncontrados.hidden = true;
  rotuloCepsEncontrados.hidden = true;
}

function aplicarCepEncontrado(cep) {
  cepEndereco.value = cep;
  atualizarEnderecoConsultado();
  statusEndereco.textContent = `CEP ${cep} preenchido. Confira o endereço antes de salvar.`;
}

async function buscarCepPorEndereco() {
  const uf = formularioEndereco.elements.uf.value.trim().toUpperCase();
  const localidade = formularioEndereco.elements.localidade.value.trim();
  const logradouro = formularioEndereco.elements.logradouro.value.trim();
  const bairro = formularioEndereco.elements.bairro.value.trim();
  statusEndereco.textContent = "";
  limparResultadosBuscaCep();

  if (!/^[A-Z]{2}$/.test(uf) || localidade.length < 3 || logradouro.length < 3
    || !bairro) {
    statusEndereco.textContent =
      "Informe Rua, Bairro, Cidade e UF. Rua e Cidade precisam ter pelo menos 3 caracteres.";
    return;
  }

  botaoBuscarCepEndereco.disabled = true;
  try {
    const consulta = [uf, localidade, logradouro].map(encodeURIComponent).join("/");
    const resposta = await fetch(`https://viacep.com.br/ws/${consulta}/json/`);
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao consultar o ViaCEP.`);
    }

    const resultados = await resposta.json();
    if (!Array.isArray(resultados)) {
      throw new Error("O ViaCEP não retornou uma lista de CEPs.");
    }

    if (formularioEndereco.elements.uf.value.trim().toUpperCase() !== uf
      || formularioEndereco.elements.localidade.value.trim() !== localidade
      || formularioEndereco.elements.logradouro.value.trim() !== logradouro
      || formularioEndereco.elements.bairro.value.trim() !== bairro) {
      statusEndereco.textContent =
        "O endereço foi alterado durante a busca. Faça a pesquisa novamente.";
      return;
    }

    const normalizarTexto = (texto) => texto.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
    const bairroNormalizado = normalizarTexto(bairro);
    const resultadosValidos = resultados.filter((resultado) =>
      resultado && typeof resultado === "object"
      && typeof resultado.cep === "string"
      && /^\d{5}-?\d{3}$/.test(resultado.cep)
      && typeof resultado.bairro === "string"
      && normalizarTexto(resultado.bairro).includes(bairroNormalizado)
    );
    if (resultadosValidos.length === 0) {
      statusEndereco.textContent = "Nenhum CEP encontrado para esse endereço.";
      return;
    }

    if (resultadosValidos.length === 1) {
      aplicarCepEncontrado(resultadosValidos[0].cep);
      return;
    }

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione o endereço correspondente";
    cepsEncontrados.append(opcaoInicial);
    resultadosValidos.forEach((resultado, indice) => {
      const opcao = document.createElement("option");
      opcao.value = String(indice);
      opcao.textContent = [
        resultado.logradouro,
        resultado.bairro,
        resultado.cep
      ].filter(Boolean).join(" - ");
      cepsEncontrados.append(opcao);
    });
    cepsEncontrados.hidden = false;
    rotuloCepsEncontrados.hidden = false;
    resultadosBuscaCep = resultadosValidos;
    statusEndereco.textContent = "Mais de um CEP foi encontrado. Selecione o endereço correspondente.";
  } catch (erro) {
    console.error("Erro ao buscar CEP pelo endereço:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível buscar um CEP para esse endereço.";
  } finally {
    botaoBuscarCepEndereco.disabled = false;
  }
}

async function abrirModalEndereco() {
  modalEndereco.showModal();
  statusEndereco.textContent = "";
  limparResultadosBuscaCep();
  enderecoConsultado = null;
  botaoSalvarEndereco.disabled = true;

  try {
    perfilAtual = await requisitarJson("/api/perfil");
    atualizarEnderecoVisivel(perfilAtual);
    preencherFormularioEndereco(perfilAtual.endereco);
    cepEndereco.focus();
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar o perfil.";
  }
}

async function buscarEnderecoPorCep() {
  const cep = cepEndereco.value.replace(/\D/g, "");
  statusEndereco.textContent = "";
  limparResultadosBuscaCep();

  if (cep.length !== 8) {
    const mensagem = "Informe um CEP válido com 8 números.";
    console.error("Erro ao consultar CEP:", mensagem);
    statusEndereco.textContent = mensagem;
    return;
  }

  botaoBuscarCep.disabled = true;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (resposta.status === 400) {
      throw new Error("Formato de CEP inválido. Informe um CEP com 8 números.");
    }
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao consultar o ViaCEP.`);
    }

    const endereco = await resposta.json();
    if (endereco.erro) {
      throw new Error("CEP não encontrado.");
    }

    preencherFormularioEndereco({
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: formularioEndereco.elements.numero.value,
      complemento: formularioEndereco.elements.complemento.value,
      bairro: endereco.bairro,
      localidade: endereco.localidade,
      uf: endereco.uf
    });

    if (!enderecoConsultado) {
      statusEndereco.textContent = "O ViaCEP não retornou todos os campos do endereço.";
      return;
    }
    statusEndereco.textContent = "Endereço encontrado.";
  } catch (erro) {
    console.error("Erro ao consultar CEP:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível consultar o CEP.";
  } finally {
    botaoBuscarCep.disabled = false;
  }
}

async function salvarEndereco(evento) {
  evento.preventDefault();
  if (!perfilAtual || !enderecoConsultado) {
    statusEndereco.textContent =
      "Informe um CEP válido e preencha Rua, Bairro, Cidade e UF antes de salvar.";
    return;
  }

  statusEndereco.textContent = "";
  botaoSalvarEndereco.disabled = true;

  try {
    await requisitarJson("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: perfilAtual.nome,
        curso: perfilAtual.curso,
        instituicao: perfilAtual.instituicao,
        endereco: enderecoConsultado
      })
    });

    perfilAtual = await requisitarJson("/api/perfil");
    atualizarEnderecoVisivel(perfilAtual);
    statusEndereco.textContent = "Endereço salvo no perfil.";
    modalEndereco.close();
  } catch (erro) {
    console.error("Erro ao salvar endereço:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar o endereço.";
  } finally {
    botaoSalvarEndereco.disabled = false;
  }
}

document.getElementById("abrir-modal-endereco")
  .addEventListener("click", abrirModalEndereco);
enderecoVisivel.addEventListener("click", abrirModalEndereco);

document.getElementById("fechar-modal-endereco")
  .addEventListener("click", () => modalEndereco.close());

modalEndereco.addEventListener("click", (evento) => {
  if (evento.target === modalEndereco) {
    modalEndereco.close();
  }
});

botaoBuscarCep.addEventListener("click", buscarEnderecoPorCep);
botaoBuscarCepEndereco.addEventListener("click", buscarCepPorEndereco);
cepsEncontrados.addEventListener("change", () => {
  if (!cepsEncontrados.value) {
    return;
  }

  const resultado = resultadosBuscaCep[Number(cepsEncontrados.value)];
  if (resultado) {
    aplicarCepEncontrado(resultado.cep);
  }
});
for (const campo of [
  cepEndereco,
  formularioEndereco.elements.logradouro,
  formularioEndereco.elements.bairro,
  formularioEndereco.elements.localidade,
  formularioEndereco.elements.uf,
  formularioEndereco.elements.numero,
  formularioEndereco.elements.complemento
]) {
  campo.addEventListener("input", () => {
    atualizarEnderecoConsultado();
    statusEndereco.textContent = "";
    if ([
      formularioEndereco.elements.logradouro,
      formularioEndereco.elements.bairro,
      formularioEndereco.elements.localidade,
      formularioEndereco.elements.uf
    ].includes(campo)) {
      limparResultadosBuscaCep();
    }
  });
}
formularioEndereco.addEventListener("submit", salvarEndereco);

export async function carregarPerfil() {
  try {
    const perfilRecebido = await requisitarJson("/api/perfil");
    perfilAtual = normalizarPerfil(perfilRecebido);
    for (const editor of editoresPerfil) {
      editor.valor.textContent = perfilAtual[editor.campo];
    }
    atualizarBotoesRedesSociais(perfilAtual.redesSociais);
    atualizarTextoSobre(perfilAtual.sobre);
    atualizarEnderecoVisivel(perfilAtual);
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}
