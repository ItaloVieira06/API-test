const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const PORTA = 3000;

// Início do servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

//BD improvisado
let disciplinas = [
    { id: 1, nome: "Tecnologias de Internet", semestre: 4 },
    { id: 2, nome: "Interação Humano Computador", semestre: 2 },
    { id: 3, nome: "Design de Jogos Digitais II", semestre: 4 }
];

const perfil = { nome: "Ítalo do Espírito Santo Vieira", curso: "Jogos Digitais", semestre: 4 };
//perfil principal
app.get("/api/perfil", (req, res) => {
    res.json(perfil);
});

let proximoId = Math.max(...disciplinas.map((disciplina) => disciplina.id)) + 1;
//buscar geral
app.get("/api/disciplinas", (req, res) => {
    res.json(disciplinas);
});

//buscar por id
app.get("/api/disciplinas/:id", (req, res) => {
  const id = Number(req.params.id);
  const disciplina = disciplinas.find((d) => d.id === id);
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }
  res.json(disciplina);
});

//adicionar
app.post("/api/disciplinas", (req, res) => {
  const { nome, semestre } = req.body || {};
  if (typeof nome !== "string" || !nome.trim()) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }
  if (!Number.isInteger(semestre) || semestre < 1) {
    return res.status(400).json({ erro: "O campo semestre deve ser um número inteiro maior que zero" });
  }
  const nova = { id: proximoId++, nome: nome.trim(), semestre };
  disciplinas.push(nova);
  res.status(201).json(nova);
});

//atualizar
app.put("/api/disciplinas/:id", (req, res) => {
  const id = Number(req.params.id);
  const disciplina = disciplinas.find((d) => d.id === id);
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  const { nome, semestre } = req.body || {};
  if (typeof nome !== "string" || !nome.trim()) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }
  if (!Number.isInteger(semestre) || semestre < 1) {
    return res.status(400).json({ erro: "O campo semestre deve ser um número inteiro maior que zero" });
  }

  disciplina.nome = nome.trim();
  disciplina.semestre = semestre;
  res.json(disciplina);
});

//excluir
app.delete("/api/disciplinas/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = disciplinas.findIndex((d) => d.id === id);
  if (indice === -1) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  const [removida] = disciplinas.splice(indice, 1);
  res.json(removida);
});