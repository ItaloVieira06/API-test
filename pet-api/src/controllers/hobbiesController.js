const hobbiesRepository = require("../repositories/hobbiesRepository");

function listarHobbies(req, res) {
  res.json(hobbiesRepository.listarHobbies());
}

function obterHobby(req, res) {
  const hobby = hobbiesRepository.buscarHobbyPorId(Number(req.params.id));
  if (!hobby) {
    return res.status(404).json({ erro: "Hobby não encontrado" });
  }

  res.json(hobby);
}

function nomeValido(nome, res) {
  if (typeof nome !== "string" || !nome.trim()) {
    res.status(400).json({ erro: "O campo nome é obrigatório" });
    return false;
  }
  if (nome.trim().length > 80) {
    res.status(400).json({ erro: "O campo nome deve ter até 80 caracteres" });
    return false;
  }
  return true;
}

function criarHobby(req, res) {
  const { nome } = req.body || {};
  if (!nomeValido(nome, res)) {
    return;
  }

  const hobby = hobbiesRepository.criarHobby(nome.trim());
  if (!hobby) {
    return res.status(400).json({ erro: "O limite de 5 hobbies foi atingido" });
  }

  res.status(201).json(hobby);
}

function atualizarHobby(req, res) {
  const id = Number(req.params.id);
  if (!hobbiesRepository.buscarHobbyPorId(id)) {
    return res.status(404).json({ erro: "Hobby não encontrado" });
  }

  const { nome } = req.body || {};
  if (!nomeValido(nome, res)) {
    return;
  }

  res.json(hobbiesRepository.atualizarHobby(id, nome.trim()));
}

function excluirHobby(req, res) {
  const hobby = hobbiesRepository.excluirHobby(Number(req.params.id));
  if (!hobby) {
    return res.status(404).json({ erro: "Hobby não encontrado" });
  }

  res.json(hobby);
}

module.exports = {
  listarHobbies,
  obterHobby,
  criarHobby,
  atualizarHobby,
  excluirHobby
};
