const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { PERFIL_PADRAO } = require("../src/models/objetos");

let app;
let servidor;
let urlBase;
let diretorioTemporario;
let arquivoPerfilTemporario;
let diretorioAssetsTemporario;

before(async () => {
  diretorioTemporario = await fs.mkdtemp(path.join(os.tmpdir(), "pet-api-test-"));
  arquivoPerfilTemporario = path.join(diretorioTemporario, "perfil.json");
  diretorioAssetsTemporario = path.join(diretorioTemporario, "assets");
  await fs.mkdir(diretorioAssetsTemporario);
  await fs.copyFile(
    path.join(__dirname, "..", "public", "assets", "Tizil.png"),
    path.join(diretorioAssetsTemporario, "Tizil.png")
  );
  await fs.writeFile(arquivoPerfilTemporario, JSON.stringify({ endereco: null }));
  process.env.PERFIL_ARQUIVO = arquivoPerfilTemporario;
  process.env.PERFIL_ASSETS_DIRETORIO = diretorioAssetsTemporario;

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
  delete process.env.PERFIL_ASSETS_DIRETORIO;
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
  const dadosPerfilInicial = await perfilInicial.json();
  assert.equal(dadosPerfilInicial.nome, "Insira seu nome");
  assert.equal(dadosPerfilInicial.curso, "Insira seu Curso");
  assert.equal(dadosPerfilInicial.instituicao, "Insira sua Instituição");
  assert.equal(dadosPerfilInicial.sobre, PERFIL_PADRAO.sobre);
  assert.equal(dadosPerfilInicial.email, "");
  assert.equal(dadosPerfilInicial.foto, PERFIL_PADRAO.foto);
  assert.equal(dadosPerfilInicial.endereco, null);
  assert.deepEqual(dadosPerfilInicial.redesSociais, PERFIL_PADRAO.redesSociais);
  assert.equal(Object.hasOwn(dadosPerfilInicial, "instituicaoVerificada"), false);

  const atualizacaoPerfilInvalida = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "", curso: "Jogos Digitais", instituicao: "Instituição de teste" })
  });
  assert.equal(atualizacaoPerfilInvalida.status, 400);

  const cursoInvalido = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "   ",
      instituicao: "Instituição de teste"
    })
  });
  assert.equal(cursoInvalido.status, 400);

  const instituicaoInvalida = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "   "
    })
  });
  assert.equal(instituicaoInvalida.status, 400);

  const instituicaoAusente = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Pessoa de teste", curso: "Jogos Digitais" })
  });
  assert.equal(instituicaoAusente.status, 400);

  const emailInvalido = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
      email: "endereco-invalido"
    })
  });
  assert.equal(emailInvalido.status, 400);

  const enderecoInvalido = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
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
      instituicao: "Instituição de teste",
      endereco: { cep: "01001000" }
    })
  });
  assert.equal(enderecoIncompleto.status, 400);

  const dadosPerfil = {
    nome: "  Pessoa de teste  ",
    curso: " Jogos Digitais ",
    instituicao: " Instituição de teste ",
    sobre: "Texto Sobre editado para teste.",
    email: "  pessoa@exemplo.com  ",
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
  const perfilAtualizado = {
    ...dadosPerfil,
    nome: dadosPerfil.nome.trim(),
    curso: dadosPerfil.curso.trim(),
    instituicao: dadosPerfil.instituicao.trim(),
    email: dadosPerfil.email.trim(),
    foto: PERFIL_PADRAO.foto,
    redesSociais: PERFIL_PADRAO.redesSociais
  };
  assert.deepEqual(await atualizacaoPerfil.json(), perfilAtualizado);

  const perfilPersistido = JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8"));
  assert.deepEqual(perfilPersistido, perfilAtualizado);
  const perfilConsultado = await fetch(`${urlBase}/api/perfil`);
  assert.deepEqual(await perfilConsultado.json(), perfilAtualizado);

  const instituicaoAtualizada = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...perfilAtualizado,
      instituicao: "Instituição atualizada"
    })
  });
  assert.equal(instituicaoAtualizada.status, 200);
  assert.equal((await instituicaoAtualizada.json()).instituicao, "Instituição atualizada");
  assert.equal(
    JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8")).instituicao,
    "Instituição atualizada"
  );
  const caminhoRepository = require.resolve("../src/repositories/perfilRepository");
  delete require.cache[caminhoRepository];
  const repositoryRecarregado = require("../src/repositories/perfilRepository");
  assert.equal(repositoryRecarregado.obterPerfil().instituicao, "Instituição atualizada");
  assert.equal(repositoryRecarregado.obterPerfil().sobre, "Texto Sobre editado para teste.");
  assert.equal(repositoryRecarregado.obterPerfil().endereco.cep, "01001-000");

  const perfilSemEndereco = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste"
    })
  });
  assert.equal(perfilSemEndereco.status, 200);
  const perfilSemEnderecoSalvo = await perfilSemEndereco.json();
  assert.equal(perfilSemEnderecoSalvo.endereco, null);
  assert.equal(perfilSemEnderecoSalvo.sobre, "Texto Sobre editado para teste.");
  assert.equal(
    JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8")).sobre,
    "Texto Sobre editado para teste."
  );

  const perfilComEnderecoNulo = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
      endereco: null
    })
  });
  assert.equal(perfilComEnderecoNulo.status, 200);
  const perfilAtualizadoEnderecoNulo = await perfilComEnderecoNulo.json();
  assert.equal(perfilAtualizadoEnderecoNulo.endereco, null);
  assert.equal(Object.hasOwn(perfilAtualizadoEnderecoNulo, "instituicaoVerificada"), false);

  const campoLegadoIgnorado = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
      instituicaoVerificada: true,
      endereco: null
    })
  });
  assert.equal(campoLegadoIgnorado.status, 200);
  assert.equal(
    Object.hasOwn(await campoLegadoIgnorado.json(), "instituicaoVerificada"),
    false
  );

  const redesSociaisInvalidas = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
      redesSociais: {
        ...PERFIL_PADRAO.redesSociais,
        github: { nome: "GitHub", url: "javascript:alert(1)" }
      }
    })
  });
  assert.equal(redesSociaisInvalidas.status, 400);

  const redesSociaisAtualizadas = {
    ...PERFIL_PADRAO.redesSociais,
    github: { nome: "Meu GitHub", url: "https://github.com/usuario" }
  };
  const atualizacaoRedeSocial = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste",
      redesSociais: redesSociaisAtualizadas
    })
  });
  assert.equal(atualizacaoRedeSocial.status, 200);
  assert.deepEqual(
    (await atualizacaoRedeSocial.json()).redesSociais,
    redesSociaisAtualizadas
  );
  assert.deepEqual(
    JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8")).redesSociais,
    redesSociaisAtualizadas
  );

  const atualizacaoOutroCampo = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste atualizada",
      curso: "Jogos Digitais",
      instituicao: "Instituição de teste"
    })
  });
  assert.equal(atualizacaoOutroCampo.status, 200);
  const perfilAposOutraAtualizacao = await atualizacaoOutroCampo.json();
  assert.deepEqual(perfilAposOutraAtualizacao.redesSociais, redesSociaisAtualizadas);
  assert.equal(perfilAposOutraAtualizacao.email, "pessoa@exemplo.com");
  assert.equal(
    JSON.parse(await fs.readFile(arquivoPerfilTemporario, "utf8")).email,
    "pessoa@exemplo.com"
  );

  delete require.cache[caminhoRepository];
  const perfilRecarregado = require("../src/repositories/perfilRepository").obterPerfil();
  assert.equal(perfilRecarregado.email, "pessoa@exemplo.com");
  assert.deepEqual(perfilRecarregado.redesSociais, redesSociaisAtualizadas);
});

test("importa, limita e seleciona fotos de perfil", async () => {
  const fotosIniciais = await fetch(`${urlBase}/api/perfil/fotos`);
  assert.equal(fotosIniciais.status, 200);
  assert.deepEqual((await fotosIniciais.json()).map((foto) => foto.src), [PERFIL_PADRAO.foto]);

  const imagemPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lQUAAAAASUVORK5CYII=";
  const arquivoInvalido = await fetch(`${urlBase}/api/perfil/fotos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo: "image/svg+xml", base64: imagemPng })
  });
  assert.equal(arquivoInvalido.status, 400);

  let ultimaImportacao;
  for (let indice = 0; indice < 5; indice++) {
    ultimaImportacao = await fetch(`${urlBase}/api/perfil/fotos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "image/png", base64: imagemPng })
    });
    assert.equal(ultimaImportacao.status, 201);
  }

  const resultadoImportacao = await ultimaImportacao.json();
  assert.equal(resultadoImportacao.fotos.length, 5);
  assert.equal(resultadoImportacao.removidas.includes(PERFIL_PADRAO.foto), true);
  assert.notEqual(resultadoImportacao.fotoAtual, PERFIL_PADRAO.foto);
  assert.equal((await fs.readdir(diretorioAssetsTemporario)).length, 5);
  const nomeFotoImportada = decodeURIComponent(
    resultadoImportacao.foto.slice("/assets/".length)
  );
  assert.deepEqual(
    await fs.readFile(path.join(diretorioAssetsTemporario, nomeFotoImportada)),
    Buffer.from(imagemPng, "base64")
  );

  const importacoesConcorrentes = await Promise.all(
    Array.from({ length: 3 }, () => fetch(`${urlBase}/api/perfil/fotos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "image/png", base64: imagemPng })
    }))
  );
  assert.ok(importacoesConcorrentes.every((resposta) => resposta.status === 201));
  assert.equal((await (await fetch(`${urlBase}/api/perfil/fotos`)).json()).length, 5);
  assert.equal((await fs.readdir(diretorioAssetsTemporario)).length, 5);

  const fotosDisponiveis = await (await fetch(`${urlBase}/api/perfil/fotos`)).json();
  const selecao = await fetch(`${urlBase}/api/perfil/foto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foto: fotosDisponiveis[0].src })
  });
  assert.equal(selecao.status, 200);
  assert.equal((await selecao.json()).foto, fotosDisponiveis[0].src);

  const atualizacaoPerfil = await fetch(`${urlBase}/api/perfil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Pessoa de teste",
      curso: "Curso atualizado",
      instituicao: "Instituição de teste"
    })
  });
  assert.equal(atualizacaoPerfil.status, 200);
  assert.equal((await atualizacaoPerfil.json()).foto, fotosDisponiveis[0].src);

  const fotoInexistente = await fetch(`${urlBase}/api/perfil/foto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foto: "/assets/nao-existe.png" })
  });
  assert.equal(fotoInexistente.status, 400);
});
