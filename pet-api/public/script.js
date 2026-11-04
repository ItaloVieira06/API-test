const data = new Date();

const dia = String(data.getDate()).padStart(2, '0');
const mes = String(data.getMonth() + 1).padStart(2, '0');
const ano = data.getFullYear();

document.getElementById('data-atual').textContent =
    `${dia}/${mes}/${ano}`;

const textoSobre = document.getElementById("texto-sobre");
const campoSobre = document.getElementById("campo-sobre");
const botaoSalvarSobre = document.getElementById("salvar-sobre");

function iniciarEdicaoSobre() {
    if (!campoSobre.hidden) {
        return;
    }

    campoSobre.value = textoSobre.textContent.trim().replace(/\s+/g, " ");
    textoSobre.hidden = true;
    campoSobre.hidden = false;
    botaoSalvarSobre.hidden = false;
    campoSobre.focus();
}

function salvarTextoSobre() {
    textoSobre.textContent = campoSobre.value.trim();
    textoSobre.hidden = false;
    campoSobre.hidden = true;
    botaoSalvarSobre.hidden = true;
}

textoSobre.addEventListener("click", iniciarEdicaoSobre);
textoSobre.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        iniciarEdicaoSobre();
    }
});
botaoSalvarSobre.addEventListener("click", salvarTextoSobre);

const botaoTema = document.getElementById("tema-btn");

botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("tema-escuro");

    if (document.body.classList.contains("tema-escuro")) {
        botaoTema.textContent = "☀️ Tema claro";
    } else {
        botaoTema.textContent = "🌙 Tema escuro";
    }
});

const upvote = document.getElementById("upvote");
const downvote = document.getElementById("downvote");
const contador = document.getElementById("contador");

let votos = 0;

upvote.addEventListener("click", function () {
    if (upvote.classList.contains("ativo")) {
        votos--;
        upvote.classList.remove("ativo");
    } else {
        votos++;

        upvote.classList.add("ativo");
        downvote.classList.remove("ativo");
    }

    contador.textContent = votos;
});

downvote.addEventListener("click", function () {
    if (downvote.classList.contains("ativo")) {
        votos++;
        downvote.classList.remove("ativo");
    } else {
        votos--;

        downvote.classList.add("ativo");
        upvote.classList.remove("ativo");
    }

    contador.textContent = votos;
});

async function mensagemDeErro(resposta) {
  let mensagem = resposta.statusText || "Erro na requisição";
  if (resposta.headers.get("content-type")?.includes("application/json")) {
    const corpo = await resposta.json();
    mensagem = corpo.erro || corpo.message || mensagem;
  }
  return `Erro ${resposta.status}: ${mensagem}`;
}

async function carregarDisciplinas() {
  const lista = document.getElementById("lista");
  lista.replaceChildren();

  try {
    const resposta = await fetch("/api/disciplinas");
    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    const disciplinas = await resposta.json();
    disciplinas.forEach((d) => {
      const li = document.createElement("li");
      li.classList.add("disciplina-item");
      const botao = document.createElement("button");
      botao.type = "button";
      botao.classList.add("disciplina-editar");
      botao.textContent = `${d.nome} (${d.semestre}º semestre)`;
      botao.addEventListener("click", () => abrirEdicaoDisciplina(d));
      li.appendChild(botao);
      lista.appendChild(li);
    });
  } catch (erro) {
    console.error("Erro ao carregar disciplinas:", erro);
    const li = document.createElement("li");
    li.classList.add("erro-lista");
    li.textContent = erro instanceof Error ? erro.message : "Não foi possível carregar as disciplinas.";
    lista.appendChild(li);
  }
}

const formularioDisciplina = document.getElementById("form-disciplina");
const erroDisciplina = document.getElementById("erro-disciplina");
const modalDisciplina = document.getElementById("modal-disciplina");
const tituloModalDisciplina = document.getElementById("titulo-modal-disciplina");
const botaoSalvarDisciplina = document.getElementById("salvar-disciplina");
const botaoExcluirDisciplina = document.getElementById("excluir-disciplina");
const idDisciplina = document.getElementById("id-disciplina");

function abrirCriacaoDisciplina() {
  formularioDisciplina.reset();
  erroDisciplina.textContent = "";
  tituloModalDisciplina.textContent = "Adicionar disciplina";
  botaoSalvarDisciplina.textContent = "Adicionar";
  botaoExcluirDisciplina.hidden = true;
  modalDisciplina.showModal();
  formularioDisciplina.elements.nome.focus();
}

function abrirEdicaoDisciplina(disciplina) {
  idDisciplina.value = disciplina.id;
  formularioDisciplina.elements.nome.value = disciplina.nome;
  formularioDisciplina.elements.semestre.value = disciplina.semestre;
  erroDisciplina.textContent = "";
  tituloModalDisciplina.textContent = "Editar disciplina";
  botaoSalvarDisciplina.textContent = "Salvar alterações";
  botaoExcluirDisciplina.hidden = false;
  modalDisciplina.showModal();
  formularioDisciplina.elements.nome.focus();
}

document.getElementById("abrir-form-disciplina").addEventListener("click", abrirCriacaoDisciplina);

document.getElementById("fechar-modal-disciplina").addEventListener("click", () => {
  modalDisciplina.close();
});

modalDisciplina.addEventListener("click", (evento) => {
  if (evento.target === modalDisciplina) {
    modalDisciplina.close();
  }
});

botaoExcluirDisciplina.addEventListener("click", async () => {
  if (idDisciplina.value === "") {
    return;
  }

  if (!window.confirm("Tem certeza de que deseja excluir esta disciplina?")) {
    return;
  }

  erroDisciplina.textContent = "";
  botaoExcluirDisciplina.disabled = true;
  botaoSalvarDisciplina.disabled = true;

  try {
    const resposta = await fetch(`/api/disciplinas/${idDisciplina.value}`, {
      method: "DELETE"
    });

    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    modalDisciplina.close();
    await carregarDisciplinas();
  } catch (erro) {
    console.error("Erro ao excluir disciplina:", erro);
    erroDisciplina.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível excluir a disciplina.";
  } finally {
    botaoExcluirDisciplina.disabled = false;
    botaoSalvarDisciplina.disabled = false;
  }
});

formularioDisciplina.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erroDisciplina.textContent = "";

  botaoSalvarDisciplina.disabled = true;

  try {
    const editando = idDisciplina.value !== "";
    const url = editando
      ? `/api/disciplinas/${idDisciplina.value}`
      : "/api/disciplinas";
    const resposta = await fetch(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formularioDisciplina.elements.nome.value.trim(),
        semestre: Number(formularioDisciplina.elements.semestre.value)
      })
    });

    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    modalDisciplina.close();
    await carregarDisciplinas();
  } catch (erro) {
    console.error("Erro ao salvar disciplina:", erro);
    erroDisciplina.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar a disciplina.";
  } finally {
    botaoSalvarDisciplina.disabled = false;
  }
});

const modalEndereco = document.getElementById("modal-endereco");
const formularioEndereco = document.getElementById("form-endereco");
const cepEndereco = document.getElementById("cep-endereco");
const botaoBuscarCep = document.getElementById("buscar-cep");
const botaoSalvarEndereco = document.getElementById("salvar-endereco");
const statusEndereco = document.getElementById("status-endereco");
const cepSalvo = document.getElementById("cep-salvo");
let perfilAtual = null;
let enderecoConsultado = null;

function atualizarCepVisivel(perfil) {
  const endereco = perfil?.endereco;
  const camposEndereco = [
    [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", "),
    [endereco?.complemento, endereco?.bairro].filter(Boolean).join(" - "),
    [endereco?.localidade, endereco?.uf].filter(Boolean).join(" - "),
    endereco?.cep ? `CEP: ${endereco.cep}` : ""
  ].filter(Boolean);

  cepSalvo.hidden = camposEndereco.length === 0;
  cepSalvo.textContent = camposEndereco.join(", ");
}

function preencherEndereco(endereco) {
  formularioEndereco.elements.cep.value = endereco?.cep || "";
  formularioEndereco.elements.logradouro.value = endereco?.logradouro || "";
  formularioEndereco.elements.numero.value = endereco?.numero || "";
  formularioEndereco.elements.complemento.value = endereco?.complemento || "";
  formularioEndereco.elements.bairro.value = endereco?.bairro || "";
  formularioEndereco.elements.localidade.value = endereco?.localidade || "";
  formularioEndereco.elements.uf.value = endereco?.uf || "";
  enderecoConsultado = endereco?.logradouro && endereco?.bairro && endereco?.localidade && endereco?.uf
    ? endereco
    : null;
  botaoSalvarEndereco.disabled = !perfilAtual || !enderecoConsultado;
}

document.getElementById("abrir-modal-endereco").addEventListener("click", async () => {
  modalEndereco.showModal();
  statusEndereco.textContent = "";
  enderecoConsultado = null;
  botaoSalvarEndereco.disabled = true;

  try {
    const resposta = await fetch("/api/perfil");
    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    perfilAtual = await resposta.json();
    atualizarCepVisivel(perfilAtual);
    preencherEndereco(perfilAtual.endereco);
    cepEndereco.focus();
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar o perfil.";
  }
});

document.getElementById("fechar-modal-endereco").addEventListener("click", () => {
  modalEndereco.close();
});

modalEndereco.addEventListener("click", (evento) => {
  if (evento.target === modalEndereco) {
    modalEndereco.close();
  }
});

botaoBuscarCep.addEventListener("click", async () => {
  const cep = cepEndereco.value.replace(/\D/g, "");
  statusEndereco.textContent = "";
  enderecoConsultado = null;
  botaoSalvarEndereco.disabled = true;

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

    const enderecoEncontrado = {
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: formularioEndereco.elements.numero.value,
      complemento: formularioEndereco.elements.complemento.value,
      bairro: endereco.bairro,
      localidade: endereco.localidade,
      uf: endereco.uf
    };
    preencherEndereco(enderecoEncontrado);
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
});

formularioEndereco.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!perfilAtual || !enderecoConsultado) {
    statusEndereco.textContent = "Busque um CEP válido antes de salvar o endereço.";
    return;
  }

  statusEndereco.textContent = "";
  botaoSalvarEndereco.disabled = true;
  try {
    const resposta = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: perfilAtual.nome,
        curso: perfilAtual.curso,
        endereco: {
          ...enderecoConsultado,
          numero: formularioEndereco.elements.numero.value.trim(),
          complemento: formularioEndereco.elements.complemento.value.trim()
        }
      })
    });
    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    const respostaPerfil = await fetch("/api/perfil");
    if (!respostaPerfil.ok) {
      throw new Error(await mensagemDeErro(respostaPerfil));
    }

    perfilAtual = await respostaPerfil.json();
    atualizarCepVisivel(perfilAtual);
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
});

async function carregarCepSalvo() {
  try {
    const resposta = await fetch("/api/perfil");
    if (!resposta.ok) {
      throw new Error(await mensagemDeErro(resposta));
    }

    perfilAtual = await resposta.json();
    atualizarCepVisivel(perfilAtual);
  } catch (erro) {
    console.error("Erro ao carregar CEP do perfil:", erro);
  }
}

async function carregarDadosIniciais() {
  const indicadorCarregamento = document.getElementById("carregando");
  try {
    await Promise.all([
      carregarDisciplinas(),
      carregarCepSalvo()
    ]);
  } finally {
    indicadorCarregamento.hidden = true;
  }
}

carregarDadosIniciais();