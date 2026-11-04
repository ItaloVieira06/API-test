const disciplinasRepository = require("../repositories/disciplinasRepository");

function listarDisciplinas(req, res) {
  res.json(disciplinasRepository.listarDisciplinas());
}

function obterDisciplina(req, res) {
  const disciplina = disciplinasRepository.buscarDisciplinaPorId(Number(req.params.id));
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  res.json(disciplina);
}

function validarDisciplina(nome, semestre, res) {
  if (typeof nome !== "string" || !nome.trim()) {
    res.status(400).json({ erro: "O campo nome é obrigatório" });
    return false;
  }
  if (!Number.isInteger(semestre) || semestre < 1) {
    res.status(400).json({ erro: "O campo semestre deve ser um número inteiro maior que zero" });
    return false;
  }

  return true;
}

function criarDisciplina(req, res) {
  const { nome, semestre } = req.body || {};
  if (!validarDisciplina(nome, semestre, res)) {
    return;
  }

  const disciplina = disciplinasRepository.criarDisciplina(nome.trim(), semestre);
  res.status(201).json(disciplina);
}

function atualizarDisciplina(req, res) {
  const id = Number(req.params.id);
  if (!disciplinasRepository.buscarDisciplinaPorId(id)) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  const { nome, semestre } = req.body || {};
  if (!validarDisciplina(nome, semestre, res)) {
    return;
  }

  const disciplina = disciplinasRepository.atualizarDisciplina(
    id,
    nome.trim(),
    semestre
  );
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  res.json(disciplina);
}

function excluirDisciplina(req, res) {
  const disciplina = disciplinasRepository.excluirDisciplina(Number(req.params.id));
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  res.json(disciplina);
}

module.exports = {
  listarDisciplinas,
  obterDisciplina,
  criarDisciplina,
  atualizarDisciplina,
  excluirDisciplina
};
