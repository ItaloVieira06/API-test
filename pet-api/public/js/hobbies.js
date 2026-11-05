import { requisitarJson } from "./api.js";

const listaHobbies = document.getElementById("lista-hobbies");
const erroListaHobbies = document.getElementById("erro-lista-hobbies");
const botaoAbrirFormulario = document.getElementById("abrir-form-hobby");
const formularioHobby = document.getElementById("form-hobby");
const erroHobby = document.getElementById("erro-hobby");
const modalHobby = document.getElementById("modal-hobby");
const tituloModalHobby = document.getElementById("titulo-modal-hobby");
const idHobby = document.getElementById("id-hobby");
const botaoSalvarHobby = document.getElementById("salvar-hobby");
const botaoExcluirHobby = document.getElementById("excluir-hobby");

function abrirFormularioHobby(hobby) {
  formularioHobby.reset();
  idHobby.value = hobby?.id || "";
  formularioHobby.elements.nome.value = hobby?.nome || "";
  erroHobby.textContent = "";
  const editando = Boolean(hobby);
  tituloModalHobby.textContent = editando ? "Editar hobby" : "Adicionar hobby";
  botaoSalvarHobby.textContent = editando ? "Salvar alterações" : "Adicionar";
  botaoExcluirHobby.hidden = !editando;
  modalHobby.showModal();
  formularioHobby.elements.nome.focus();
}

export async function carregarHobbies() {
  listaHobbies.replaceChildren();
  try {
    const hobbies = await requisitarJson("/api/hobbies");
    botaoAbrirFormulario.disabled = hobbies.length >= 5;
    botaoAbrirFormulario.title = botaoAbrirFormulario.disabled
      ? "O limite de 5 hobbies foi atingido."
      : "";
    for (const hobby of hobbies) {
      const item = document.createElement("li");
      item.classList.add("disciplina-item");
      const botao = document.createElement("button");
      botao.type = "button";
      botao.classList.add("disciplina-editar");
      botao.textContent = hobby.nome;
      botao.addEventListener("click", () => abrirFormularioHobby(hobby));
      item.append(botao);
      listaHobbies.append(item);
    }
    erroListaHobbies.textContent = "";
  } catch (erro) {
    console.error("Erro ao carregar hobbies:", erro);
    erroListaHobbies.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar os hobbies.";
  }
}

botaoAbrirFormulario
  .addEventListener("click", () => abrirFormularioHobby());
document.getElementById("fechar-modal-hobby")
  .addEventListener("click", () => modalHobby.close());
modalHobby.addEventListener("click", (evento) => {
  if (evento.target === modalHobby) {
    modalHobby.close();
  }
});

botaoExcluirHobby.addEventListener("click", async () => {
  if (!idHobby.value || !window.confirm("Tem certeza de que deseja excluir este hobby?")) {
    return;
  }

  erroHobby.textContent = "";
  botaoExcluirHobby.disabled = true;
  botaoSalvarHobby.disabled = true;
  try {
    await requisitarJson(`/api/hobbies/${idHobby.value}`, { method: "DELETE" });
    modalHobby.close();
    await carregarHobbies();
  } catch (erro) {
    console.error("Erro ao excluir hobby:", erro);
    erroHobby.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível excluir o hobby.";
  } finally {
    botaoExcluirHobby.disabled = false;
    botaoSalvarHobby.disabled = false;
  }
});

formularioHobby.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erroHobby.textContent = "";
  botaoSalvarHobby.disabled = true;
  const editando = idHobby.value !== "";
  try {
    await requisitarJson(editando ? `/api/hobbies/${idHobby.value}` : "/api/hobbies", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: formularioHobby.elements.nome.value.trim() })
    });
    modalHobby.close();
    await carregarHobbies();
  } catch (erro) {
    console.error("Erro ao salvar hobby:", erro);
    erroHobby.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar o hobby.";
  } finally {
    botaoSalvarHobby.disabled = false;
  }
});
