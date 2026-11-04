import { carregarDisciplinas } from "./disciplinas.js";
import { inicializarInterface } from "./interface.js";
import { carregarPerfil } from "./perfil.js";

async function carregarDadosIniciais() {
  const indicadorCarregamento = document.getElementById("carregando");

  try {
    await Promise.all([
      carregarPerfil(),
      carregarDisciplinas()
    ]);
  } finally {
    indicadorCarregamento.hidden = true;
  }
}

inicializarInterface();
carregarDadosIniciais();
