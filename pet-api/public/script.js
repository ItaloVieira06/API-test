const data = new Date();

const dia = String(data.getDate()).padStart(2, '0');
const mes = String(data.getMonth() + 1).padStart(2, '0');
const ano = data.getFullYear();

document.getElementById('data-atual').textContent =
    `${dia}/${mes}/${ano}`;

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
let disciplinaEmEdicao = null;

function abrirCriacaoDisciplina() {
  disciplinaEmEdicao = null;
  formularioDisciplina.reset();
  erroDisciplina.textContent = "";
  tituloModalDisciplina.textContent = "Adicionar disciplina";
  botaoSalvarDisciplina.textContent = "Adicionar";
  botaoExcluirDisciplina.hidden = true;
  modalDisciplina.showModal();
  formularioDisciplina.elements.nome.focus();
}

function abrirEdicaoDisciplina(disciplina) {
  disciplinaEmEdicao = disciplina.id;
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
  if (disciplinaEmEdicao === null) {
    return;
  }

  if (!window.confirm("Tem certeza de que deseja excluir esta disciplina?")) {
    return;
  }

  erroDisciplina.textContent = "";
  botaoExcluirDisciplina.disabled = true;
  botaoSalvarDisciplina.disabled = true;

  try {
    const resposta = await fetch(`/api/disciplinas/${disciplinaEmEdicao}`, {
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
    const url = disciplinaEmEdicao === null
      ? "/api/disciplinas"
      : `/api/disciplinas/${disciplinaEmEdicao}`;
    const resposta = await fetch(url, {
      method: disciplinaEmEdicao === null ? "POST" : "PUT",
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

carregarDisciplinas();