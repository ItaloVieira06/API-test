const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { after, before, test } = require("node:test");

let app;
let servidor;
let urlBase;
let diretorioTemporario;
let arquivoPerfilTemporario;

before(async () => {
  diretorioTemporario = await fs.mkdtemp(path.join(os.tmpdir(), "pet-api-test-"));
  arquivoPerfilTemporario = path.join(diretorioTemporario, "perfil.json");
  process.env.PERFIL_ARQUIVO = arquivoPerfilTemporario;

  app = require("../src/app");
  servidor = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    servidor.once("listening", resolve);
    servidor.once("error", reject);
  });

  urlBase = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  if (servidor) {
    await new Promise((resolve, reject) => {
      servidor.close((erro) => erro ? reject(erro) : resolve());
    });
  }
  delete process.env.PERFIL_ARQUIVO;
  if (diretorioTemporario) {
    await fs.rm(diretorioTemporario, { recursive: true, force: true });
  }
});

test("expõe a interface e os contratos da API", async () => {
  const pagina = await fetch(urlBase);
  assert.equal(pagina.status, 200);
  assert.match(pagina.headers.get("content-type"), /text\/html/);

  const listaInicial = await fetch(`${urlBase}/api/disciplinas`);
  assert.equal(listaInicial.status, 200);
  const disciplinas = await listaInicial.json();
  assert.ok(disciplinas.length > 0);

  const disciplinaInicial = await fetch(`${urlBase}/api/disciplinas/1`);
  assert.equal(disciplinaInicial.status, 200);
  assert.equal((await disciplinaInicial.json()).id, 1);

  const disciplinaInexistente = await fetch(`${urlBase}/api/disciplinas/999999`);
  assert.equal(disciplinaInexistente.status, 404);

  const criacaoInvalida = await fetch(`${urlBase}/api/disciplinas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Semestre inválido", semestre: 0 })
  });
  assert.equal(criacaoInvalida.status, 400);

  const criacao = await fetch(`${urlBase}/api/disciplinas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "  Teste automatizado  ", semestre: 1 })
  });
  assert.equal(criacao.status, 201);
  const disciplinaCriada = await criacao.json();
  assert.equal(disciplinaCriada.nome, "Teste automatizado");

  const atualizacao = await fetch(`${urlBase}/api/disciplinas/${disciplinaCriada.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Disciplina atualizada", semestre: 2 })
  });
  assert.equal(atualizacao.status, 200);
  assert.equal((await atualizacao.json()).semestre, 2);

  const exclusao = await fetch(`${urlBase}/api/disciplinas/${disciplinaCriada.id}`, {
    method: "DELETE"
  });
  assert.equal(exclusao.status, 200);
  const aposExclusao = await fetch(`${urlBase}/api/disciplinas/${disciplinaCriada.id}`);
  assert.equal(aposExclusao.status, 404);

  const perfilInicial = await fetch(`${urlBase}/api/perfil`);
  assert.equal(perfilInicial.status, 200);
  assert.equal(typeof (await perfilInicial.json()).nome, "string");

  const atualizacaoPerfilInvalida = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "", curso: "Jogos Digitais" })
  });
  assert.equal(atualizacaoPerfilInvalida.status, 400);

  const enderecoInvalido = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      endereco: {
        cep: "123",
        logradouro: "Rua de teste",
        bairro: "Centro",
        localidade: "São Paulo",
        uf: "SP"
      }
    })
  });
  assert.equal(enderecoInvalido.status, 400);

  const enderecoIncompleto = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      endereco: { cep: "01001000" }
    })
  });
  assert.equal(enderecoIncompleto.status, 400);

  const dadosPerfil = {
    nome: "Pessoa de teste",
    curso: "Jogos Digitais",
    endereco: {
      cep: "01001-000",
      logradouro: "Praça da Sé",
      numero: "10",
      complemento: "",
      bairro: "Sé",
      localidade: "São Paulo",
      uf: "SP"
    }
  };
  const atualizacaoPerfil = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosPerfil)
  });
  assert.equal(atualizacaoPerfil.status, 200);
  assert.deepEqual(await atualizacaoPerfil.json(), dadosPerfil);

  const perfilPersistido = JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8"));
  assert.deepEqual(perfilPersistido, dadosPerfil);
  const perfilConsultado = await fetch(`${urlBase}/api/perfil`);
  assert.deepEqual(await perfilConsultado.json(), dadosPerfil);

  const perfilSemEndereco = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Pessoa de teste", curso: "Jogos Digitais" })
  });
  assert.equal(perfilSemEndereco.status, 200);
  assert.equal((await perfilSemEndereco.json()).endereco, null);

  const perfilComEnderecoNulo = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Pessoa de teste", curso: "Jogos Digitais", endereco: null })
  });
  assert.equal(perfilComEnderecoNulo.status, 200);
  assert.equal((await perfilComEnderecoNulo.json()).endereco, null);
});
