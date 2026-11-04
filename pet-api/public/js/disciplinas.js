import { requisitarJson } from "./api.js";

const listaDisciplinas = document.getElementById("lista");
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

export async function carregarDisciplinas() {
  listaDisciplinas.replaceChildren();

  try {
    const disciplinas = await requisitarJson("/api/disciplinas");
    disciplinas.forEach((disciplina) => {
      const item = document.createElement("li");
      item.classList.add("disciplina-item");

      const botao = document.createElement("button");
      botao.type = "button";
      botao.classList.add("disciplina-editar");
      botao.textContent = `${disciplina.nome} (${disciplina.semestre}º semestre)`;
      botao.addEventListener("click", () => abrirEdicaoDisciplina(disciplina));

      item.appendChild(botao);
      listaDisciplinas.appendChild(item);
    });
  } catch (erro) {
    console.error("Erro ao carregar disciplinas:", erro);
    const item = document.createElement("li");
    item.classList.add("erro-lista");
    item.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar as disciplinas.";
    listaDisciplinas.appendChild(item);
  }
}

document.getElementById("abrir-form-disciplina")
  .addEventListener("click", abrirCriacaoDisciplina);

document.getElementById("fechar-modal-disciplina")
  .addEventListener("click", () => modalDisciplina.close());

modalDisciplina.addEventListener("click", (evento) => {
  if (evento.target === modalDisciplina) {
    modalDisciplina.close();
  }
});

botaoExcluirDisciplina.addEventListener("click", async () => {
  if (idDisciplina.value === "" || !window.confirm("Tem certeza de que deseja excluir esta disciplina?")) {
    return;
  }

  erroDisciplina.textContent = "";
  botaoExcluirDisciplina.disabled = true;
  botaoSalvarDisciplina.disabled = true;

  try {
    await requisitarJson(`/api/disciplinas/${idDisciplina.value}`, { method: "DELETE" });
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
    const url = editando ? `/api/disciplinas/${idDisciplina.value}` : "/api/disciplinas";
    await requisitarJson(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formularioDisciplina.elements.nome.value.trim(),
        semestre: Number(formularioDisciplina.elements.semestre.value)
      })
    });

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
