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

function inicializarVotacao() {
  const botaoPositivo = document.getElementById("upvote");
  const botaoNegativo = document.getElementById("downvote");
  const contador = document.getElementById("contador");
  let votos = 0;

  botaoPositivo.addEventListener("click", () => {
    if (botaoPositivo.classList.contains("ativo")) {
      votos--;
      botaoPositivo.classList.remove("ativo");
    } else {
      votos++;
      botaoPositivo.classList.add("ativo");
      botaoNegativo.classList.remove("ativo");
    }
    contador.textContent = votos;
  });

  botaoNegativo.addEventListener("click", () => {
    if (botaoNegativo.classList.contains("ativo")) {
      votos++;
      botaoNegativo.classList.remove("ativo");
    } else {
      votos--;
      botaoNegativo.classList.add("ativo");
      botaoPositivo.classList.remove("ativo");
    }
    contador.textContent = votos;
  });
}

function inicializarEditorSobre() {
  const textoSobre = document.getElementById("texto-sobre");
  const campoSobre = document.getElementById("campo-sobre");
  const botaoSalvarSobre = document.getElementById("salvar-sobre");

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

  function salvarEdicao() {
    textoSobre.textContent = campoSobre.value.trim();
    textoSobre.hidden = false;
    campoSobre.hidden = true;
    botaoSalvarSobre.hidden = true;
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

export function inicializarInterface() {
  inicializarDataAtual();
  inicializarTema();
  inicializarVotacao();
  inicializarEditorSobre();
}
