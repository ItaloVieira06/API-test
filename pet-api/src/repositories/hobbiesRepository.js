const { criarHobby } = require("../models/objetos");

let hobbies = ["Programação", "Fotografia", "Jogos"].map((nome, indice) =>
  criarHobby({ id: indice + 1, nome })
);
let proximoId = hobbies.length + 1;

function listarHobbies() {
  return hobbies;
}

function buscarHobbyPorId(id) {
  return hobbies.find((hobby) => hobby.id === id);
}

function criarHobbyNovo(nome) {
  if (hobbies.length >= 5) {
    return null;
  }

  const hobby = criarHobby({ id: proximoId++, nome });
  hobbies.push(hobby);
  return hobby;
}

function atualizarHobby(id, nome) {
  const hobby = buscarHobbyPorId(id);
  if (!hobby) {
    return null;
  }

  hobby.nome = nome;
  return hobby;
}

function excluirHobby(id) {
  const indice = hobbies.findIndex((hobby) => hobby.id === id);
  return indice === -1 ? null : hobbies.splice(indice, 1)[0];
}

module.exports = {
  listarHobbies,
  buscarHobbyPorId,
  criarHobby: criarHobbyNovo,
  atualizarHobby,
  excluirHobby
};
