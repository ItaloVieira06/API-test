import { carregarDisciplinas } from "./disciplinas.js";
import { carregarHobbies } from "./hobbies.js";
import { inicializarInterface } from "./interface.js";
import {
  carregarPerfil,
  inicializarEdicaoPerfil,
  inicializarEdicaoRedesSociais,
  inicializarContatoPerfil,
  inicializarEditorFotoPerfil
} from "./perfil.js";

async function carregarDadosIniciais() {
  const indicadorCarregamento = document.getElementById("carregando");

  try {
    await Promise.all([
      carregarPerfil(),
      carregarDisciplinas(),
      carregarHobbies()
    ]);
  } finally {
    indicadorCarregamento.hidden = true;
  }
}

inicializarInterface();
inicializarEdicaoPerfil();
inicializarEdicaoRedesSociais();
inicializarContatoPerfil();
inicializarEditorFotoPerfil();
carregarDadosIniciais();
