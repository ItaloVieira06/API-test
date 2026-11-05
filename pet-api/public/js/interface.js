import { requisitarJson } from "./api.js";

function inicializarDataAtual() {
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  document.getElementById("data-atual").textContent = `${dia}/${mes}/${ano}`;
}

function inicializarTema() {
  const botaoTema = document.getElementById("tema-btn");
  botaoTema.addEventListener("click", () => {
    document.body.classList.toggle("tema-escuro");
    botaoTema.textContent = document.body.classList.contains("tema-escuro")
      ? "☀️ Tema claro"
      : "🌙 Tema escuro";
  });
}

function inicializarEditorSobre() {
  const textoSobre = document.getElementById("texto-sobre");
  const campoSobre = document.getElementById("campo-sobre");
  const botaoSalvarSobre = document.getElementById("salvar-sobre");
  const erroSobre = document.getElementById("erro-sobre");

  function iniciarEdicao() {
    if (!campoSobre.hidden) {
      return;
    }

    campoSobre.value = textoSobre.textContent.trim().replace(/\s+/g, " ");
    textoSobre.hidden = true;
    campoSobre.hidden = false;
    botaoSalvarSobre.hidden = false;
    campoSobre.focus();
  }

  async function salvarEdicao() {
    botaoSalvarSobre.disabled = true;
    erroSobre.hidden = true;
    erroSobre.textContent = "";

    try {
      const perfil = await requisitarJson("/api/perfil");
      const perfilSalvo = await requisitarJson("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, sobre: campoSobre.value.trim() })
      });

      atualizarTextoSobre(perfilSalvo.sobre);
      textoSobre.hidden = false;
      campoSobre.hidden = true;
      botaoSalvarSobre.hidden = true;
    } catch (erro) {
      console.error("Erro ao salvar texto Sobre:", erro);
      erroSobre.textContent = erro instanceof Error
        ? erro.message
        : "Não foi possível salvar o texto Sobre.";
      erroSobre.hidden = false;
    } finally {
      botaoSalvarSobre.disabled = false;
    }
  }

  textoSobre.addEventListener("click", iniciarEdicao);
  textoSobre.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      iniciarEdicao();
    }
  });
  botaoSalvarSobre.addEventListener("click", salvarEdicao);
}

export function atualizarTextoSobre(texto) {
  if (typeof texto === "string") {
    document.getElementById("texto-sobre").textContent = texto;
  }
}

export function inicializarInterface() {
  inicializarDataAtual();
  inicializarTema();
  inicializarEditorSobre();
}
