const { criarDisciplina: construirDisciplina } = require("../models/objetos");

let disciplinas = [
  construirDisciplina({ id: 1, nome: "Tecnologias de Internet", semestre: 4 }),
  construirDisciplina({ id: 2, nome: "Interação Humano Computador", semestre: 2 }),
  construirDisciplina({ id: 3, nome: "Design de Jogos Digitais II", semestre: 4 })
];

let proximoId = Math.max(...disciplinas.map((disciplina) => disciplina.id)) + 1;

function listarDisciplinas() {
  return disciplinas;
}

function buscarDisciplinaPorId(id) {
  return disciplinas.find((disciplina) => disciplina.id === id);
}

function criarDisciplina(nome, semestre) {
  const disciplina = construirDisciplina({ id: proximoId++, nome, semestre });
  disciplinas.push(disciplina);
  return disciplina;
}

function atualizarDisciplina(id, nome, semestre) {
  const disciplina = buscarDisciplinaPorId(id);
  if (!disciplina) {
    return null;
  }

  disciplina.nome = nome;
  disciplina.semestre = semestre;
  return disciplina;
}

function excluirDisciplina(id) {
  const indice = disciplinas.findIndex((disciplina) => disciplina.id === id);
  if (indice === -1) {
    return null;
  }

  return disciplinas.splice(indice, 1)[0];
}

module.exports = {
  listarDisciplinas,
  buscarDisciplinaPorId,
  criarDisciplina,
  atualizarDisciplina,
  excluirDisciplina
};
