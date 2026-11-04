const express = require("express");
const path = require("path");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const PORTA = Number(process.env.PORT) || 3000;
const ARQUIVO_PERFIL = path.join(__dirname, "perfil.json");

//BD improvisado
let disciplinas = [
    { id: 1, nome: "Tecnologias de Internet", semestre: 4 },
    { id: 2, nome: "Interação Humano Computador", semestre: 2 },
    { id: 3, nome: "Design de Jogos Digitais II", semestre: 4 }
];

//interface do perfil
let perfil = {
  nome: "Ítalo do Espírito Santo Vieira",
  curso: "Jogos Digitais",
  endereco: null
};

//perfil save/load
if (fs.existsSync(ARQUIVO_PERFIL)) {
  perfil = { ...perfil, ...JSON.parse(fs.readFileSync(ARQUIVO_PERFIL, "utf8")) };
}

//rota GET perfil
app.get("/api/perfil", (req, res) => {
    res.json(perfil);
});

//rota PUT perfil + tratamento de erros
app.put("/api/perfil", async (req, res) => {
  const { nome, curso, endereco } = req.body || {};
  if (typeof nome !== "string" || !nome.trim()) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }
  if (typeof curso !== "string" || !curso.trim()) {
    return res.status(400).json({ erro: "O campo curso é obrigatório" });
  }

  const enderecoSalvo = endereco && typeof endereco === "object"
    ? {
      ...endereco,
      numero: typeof endereco.numero === "string" ? endereco.numero.trim() : "",
      complemento: typeof endereco.complemento === "string" ? endereco.complemento.trim() : ""
    }
    : endereco ?? null;

  const perfilAtualizado = {
    nome: nome.trim(),
    curso: curso.trim(),
    endereco: enderecoSalvo
  };

  try {
    await fsPromises.writeFile(ARQUIVO_PERFIL, `${JSON.stringify(perfilAtualizado, null, 2)}\n`);
  } catch (erro) {
    console.error("Erro ao persistir perfil:", erro);
    return res.status(500).json({ erro: "Não foi possível salvar o perfil." });
  }

  perfil = perfilAtualizado;
  res.json(perfilAtualizado);
});

let proximoId = Math.max(...disciplinas.map((disciplina) => disciplina.id)) + 1;
//buscar disciplinas em geral
app.get("/api/disciplinas", (req, res) => {
    res.json(disciplinas);
});

//buscar disciplinas por id
app.get("/api/disciplinas/:id", (req, res) => {
  const id = Number(req.params.id);
  const disciplina = disciplinas.find((d) => d.id === id);
  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }
  res.json(disciplina);
});

//adicionar disciplinas
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

//atualizar disciplinas
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

//excluir disciplinas
app.delete("/api/disciplinas/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = disciplinas.findIndex((d) => d.id === id);
  if (indice === -1) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  const [removida] = disciplinas.splice(indice, 1);
  res.json(removida);
});

// Início do servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});