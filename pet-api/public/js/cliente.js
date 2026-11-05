const statusCarregamento = document.querySelector("#status-carregamento");
const statusVotos = document.querySelector("#status-votos");
const botaoUpvote = document.querySelector("#upvote");
const botaoDownvote = document.querySelector("#downvote");
const botoesVoto = [botaoUpvote, botaoDownvote];
const modalEnvioEmail = document.querySelector("#modal-envio-email");
const formularioEnvioEmail = document.querySelector("#form-envio-email");
const campoAssuntoEmail = document.querySelector("#assunto-email");
const campoMensagemEmail = document.querySelector("#mensagem-email");
const statusEnvioEmail = document.querySelector("#status-envio-email");
let idSessao;
let votoAtual = null;
let requisicaoVotoAtiva = false;
let perfilCarregado = false;
let emailDestinatario = "";

function inicializarCabecalhoERodape() {
  const botaoTema = document.querySelector("#tema-btn");
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");

  document.querySelector("#data-atual").textContent =
    `${dia}/${mes}/${data.getFullYear()}`;
  botaoTema.addEventListener("click", () => {
    const temaEscuroAtivo = document.body.classList.toggle("tema-escuro");
    botaoTema.textContent = temaEscuroAtivo ? "☀️ Tema claro" : "🌙 Tema escuro";
    botaoTema.setAttribute("aria-pressed", String(temaEscuroAtivo));
  });
}

function obterIdSessao() {
  const salvo = sessionStorage.getItem("cliente-voter-id");
  if (salvo && /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(salvo)) {
    return salvo;
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hexadecimal = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const novoId = [
    hexadecimal.slice(0, 8),
    hexadecimal.slice(8, 12),
    hexadecimal.slice(12, 16),
    hexadecimal.slice(16, 20),
    hexadecimal.slice(20)
  ].join("-");
  sessionStorage.setItem("cliente-voter-id", novoId);
  return novoId;
}

async function requisitar(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  const tipoConteudo = resposta.headers.get("content-type") || "";
  if (!tipoConteudo.includes("application/json")) {
    throw new Error(
      `A API respondeu com conteúdo inesperado (${tipoConteudo || "sem tipo informado"}). `
      + "Confirme se o servidor atualizado está ativo na mesma porta da página."
    );
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível carregar os dados.");
  }
  return dados;
}

function definirTexto(seletor, texto) {
  document.querySelector(seletor).textContent = texto;
}

function preencherLista(seletor, itens, formatar) {
  const lista = document.querySelector(seletor);
  lista.replaceChildren(...itens.map((item) => {
    const elemento = document.createElement("li");
    elemento.textContent = formatar(item);
    return elemento;
  }));
}

function formatarEndereco(endereco) {
  if (!endereco) {
    return "";
  }
  const rua = [endereco.logradouro, endereco.numero, endereco.complemento]
    .filter(Boolean)
    .join(", ");
  const cidade = [endereco.bairro, endereco.localidade, endereco.uf]
    .filter(Boolean)
    .join(" - ");
  return [rua, cidade, endereco.cep].filter(Boolean).join(" | ");
}

function preencherPerfil(perfil) {
  document.querySelector("#foto-perfil").src = perfil.foto;
  document.querySelector("#foto-perfil").alt = `Foto de ${perfil.nome}`;
  definirTexto("#nome-perfil", perfil.nome);
  definirTexto("#curso-perfil", perfil.curso);
  definirTexto("#instituicao-perfil", perfil.instituicao);
  document.querySelector("#separador-formacao").hidden = !perfil.curso || !perfil.instituicao;
  definirTexto("#endereco-perfil", formatarEndereco(perfil.endereco));
  definirTexto("#texto-sobre", perfil.sobre);
  emailDestinatario = typeof perfil.email === "string" ? perfil.email.trim() : "";
  const links = document.querySelector("#links-perfil");
  let botaoContato;

  if (emailDestinatario) {
    botaoContato = document.createElement("button");
    botaoContato.type = "button";
    botaoContato.className = "link-perfil";
    botaoContato.textContent = "Entrar em Contato";
    botaoContato.addEventListener("click", abrirFormularioEnvioEmail);
  }

  const linksRedesSociais = document.createElement("div");
  linksRedesSociais.className = "links-redes-sociais";
  for (const rede of Object.values(perfil.redesSociais || {})) {
    let url;
    try {
      url = new URL(rede.url);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      continue;
    }

    const link = document.createElement("a");
    link.className = "link-perfil";
    link.textContent = rede.nome;
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    linksRedesSociais.append(link);
  }

  links.replaceChildren(...[
    botaoContato,
    linksRedesSociais.childElementCount ? linksRedesSociais : null
  ].filter(Boolean));
}

function abrirFormularioEnvioEmail() {
  formularioEnvioEmail.reset();
  statusEnvioEmail.hidden = true;
  statusEnvioEmail.classList.remove("erro");
  definirTexto("#destinatario-email", emailDestinatario);
  modalEnvioEmail.showModal();
  campoAssuntoEmail.focus();
}

function enviarEmailPeloAplicativoPadrao(evento) {
  evento.preventDefault();
  const assunto = campoAssuntoEmail.value.trim();
  const mensagem = campoMensagemEmail.value.trim();
  if (!emailDestinatario || !assunto || !mensagem) {
    statusEnvioEmail.textContent = "Informe um assunto e uma mensagem para continuar.";
    statusEnvioEmail.classList.add("erro");
    statusEnvioEmail.hidden = false;
    return;
  }

  const destinatario = encodeURIComponent(emailDestinatario).replace(/%40/i, "@");
  const parametros = new URLSearchParams({ subject: assunto, body: mensagem });
  statusEnvioEmail.textContent = "O aplicativo de email será aberto para você revisar e confirmar o envio.";
  statusEnvioEmail.classList.remove("erro");
  statusEnvioEmail.hidden = false;
  window.location.href = `mailto:${destinatario}?${parametros.toString()}`;
}

function atualizarInterfaceVoto(dados) {
  if (!Number.isSafeInteger(dados.pontuacao)
    || ![null, "up", "down"].includes(dados.voto)) {
    throw new Error("A resposta da votação está inválida.");
  }
  votoAtual = dados.voto;
  document.querySelector("#pontuacao").textContent = String(dados.pontuacao);
  botaoUpvote.classList.toggle("selecionado", votoAtual === "up");
  botaoDownvote.classList.toggle("selecionado", votoAtual === "down");
  botaoUpvote.setAttribute("aria-pressed", String(votoAtual === "up"));
  botaoDownvote.setAttribute("aria-pressed", String(votoAtual === "down"));
}

async function atualizarVotos() {
  if (requisicaoVotoAtiva) {
    return;
  }
  const dados = await requisitar("/api/votos", {
    headers: { "X-Voter-Id": idSessao }
  });
  atualizarInterfaceVoto(dados);
  if (perfilCarregado && !requisicaoVotoAtiva) {
    botoesVoto.forEach((botao) => { botao.disabled = false; });
  }
  statusVotos.textContent = "";
  statusVotos.classList.remove("erro");
}

async function clicarVoto(escolha) {
  if (requisicaoVotoAtiva) {
    return;
  }
  requisicaoVotoAtiva = true;
  botoesVoto.forEach((botao) => { botao.disabled = true; });
  statusVotos.textContent = "";
  statusVotos.classList.remove("erro");

  try {
    const dados = await requisitar("/api/votos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Voter-Id": idSessao
      },
      body: JSON.stringify({ voto: escolha })
    });
    atualizarInterfaceVoto(dados);
  } catch (erro) {
    statusVotos.textContent = erro.message;
    statusVotos.classList.add("erro");
  } finally {
    requisicaoVotoAtiva = false;
    botoesVoto.forEach((botao) => { botao.disabled = false; });
  }
}

async function inicializar() {
  try {
    idSessao = obterIdSessao();
    const [perfil, disciplinas, hobbies] = await Promise.all([
      requisitar("/api/perfil"),
      requisitar("/api/disciplinas"),
      requisitar("/api/hobbies")
    ]);
    preencherPerfil(perfil);
    preencherLista("#lista-disciplinas", disciplinas, (disciplina) => (
      `${disciplina.nome} — ${disciplina.semestre}º semestre`
    ));
    preencherLista("#lista-hobbies", hobbies, (hobby) => hobby.nome);
    statusCarregamento.hidden = true;
    perfilCarregado = true;
  } catch (erro) {
    statusCarregamento.textContent = `Não foi possível carregar o perfil: ${erro.message}`;
    statusCarregamento.classList.add("erro");
    return;
  }

  try {
    await atualizarVotos();
    botoesVoto.forEach((botao) => { botao.disabled = false; });
  } catch (erro) {
    statusVotos.textContent = erro.message;
    statusVotos.classList.add("erro");
  }
}

botaoUpvote.addEventListener("click", () => clicarVoto("up"));
botaoDownvote.addEventListener("click", () => clicarVoto("down"));
formularioEnvioEmail.addEventListener("submit", enviarEmailPeloAplicativoPadrao);
document.querySelector("#fechar-modal-email")
  .addEventListener("click", () => modalEnvioEmail.close());
document.querySelector("#cancelar-envio-email")
  .addEventListener("click", () => modalEnvioEmail.close());
modalEnvioEmail.addEventListener("click", (evento) => {
  if (evento.target === modalEnvioEmail) {
    modalEnvioEmail.close();
  }
});
inicializarCabecalhoERodape();
inicializar();

window.addEventListener("focus", () => {
  if (!document.hidden && idSessao && perfilCarregado) {
    atualizarVotos().catch((erro) => {
      statusVotos.textContent = erro.message;
      statusVotos.classList.add("erro");
    });
  }
});
window.setInterval(() => {
  if (!document.hidden && idSessao && perfilCarregado) {
    atualizarVotos().catch((erro) => {
      statusVotos.textContent = erro.message;
      statusVotos.classList.add("erro");
    });
  }
}, 15000);
