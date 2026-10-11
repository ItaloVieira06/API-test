const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));
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

let proximoId = 3;
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
  if (!nome) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }
  const nova = { id: proximoId++, nome, semestre };
  disciplinas.push(nova);
  res.status(201).json(nova);
});