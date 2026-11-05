const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  PERFIL_PADRAO,
  criarPerfil,
  criarEndereco,
  criarDisciplina
} = require("../src/models/objetos");

test("fábricas produzem formatos consistentes para os objetos JSON da API", () => {
  assert.deepEqual(criarPerfil(), PERFIL_PADRAO);
  assert.deepEqual(criarPerfil({ nome: "Pessoa", curso: "Curso" }), {
    nome: "Pessoa",
    curso: "Curso",
    instituicao: PERFIL_PADRAO.instituicao,
    sobre: PERFIL_PADRAO.sobre,
    email: PERFIL_PADRAO.email,
    endereco: null,
    redesSociais: PERFIL_PADRAO.redesSociais
  });
  assert.deepEqual(criarPerfil({
    nome: " ",
    curso: "",
    instituicao: null,
    endereco: ""
  }), PERFIL_PADRAO);
  assert.deepEqual(
    criarPerfil({ redesSociais: {} }).redesSociais,
    PERFIL_PADRAO.redesSociais
  );
  assert.deepEqual(criarPerfil({
    redesSociais: {
      github: { nome: "Meu GitHub", url: "https://github.com/perfil" },
      instagram: { nome: "", url: "javascript:alert(1)" }
    }
  }).redesSociais, {
    github: { nome: "Meu GitHub", url: "https://github.com/perfil" },
    instagram: PERFIL_PADRAO.redesSociais.instagram,
    linkedin: PERFIL_PADRAO.redesSociais.linkedin
  });
  assert.deepEqual(criarEndereco({
    cep: "01001-000",
    logradouro: "Praça da Sé",
    numero: "",
    complemento: "",
    bairro: "Sé",
    localidade: "São Paulo",
    uf: "SP"
  }), {
    cep: "01001-000",
    logradouro: "Praça da Sé",
    numero: "",
    complemento: "",
    bairro: "Sé",
    localidade: "São Paulo",
    uf: "SP"
  });
  assert.equal(criarEndereco({
    cep: "01001-000",
    logradouro: "Praça da Sé",
    bairro: "Sé",
    localidade: "São Paulo",
    uf: "SP"
  }).numero, "");
  assert.deepEqual(criarDisciplina({
    id: 1,
    nome: "Banco de Dados",
    semestre: 3
  }), {
    id: 1,
    nome: "Banco de Dados",
    semestre: 3
  });
});
