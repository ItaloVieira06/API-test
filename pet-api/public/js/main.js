import { carregarDisciplinas } from "./disciplinas.js";
import { inicializarInterface } from "./interface.js";
import {
  carregarPerfil,
  inicializarEdicaoPerfil,
  inicializarEdicaoRedesSociais,
  inicializarContatoPerfil
} from "./perfil.js";

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
inicializarEdicaoPerfil();
inicializarEdicaoRedesSociais();
inicializarContatoPerfil();
carregarDadosIniciais();
