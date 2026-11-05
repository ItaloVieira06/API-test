const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");
const { criarPerfil, PERFIL_PADRAO } = require("../models/objetos");

const ARQUIVO_PERFIL = process.env.PERFIL_ARQUIVO
  || path.join(__dirname, "..", "..", "perfil.json");

const perfilExistente = fs.existsSync(ARQUIVO_PERFIL)
  ? JSON.parse(fs.readFileSync(ARQUIVO_PERFIL, "utf8"))
  : {};
delete perfilExistente.instituicaoVerificada;

let perfil = criarPerfil({ ...PERFIL_PADRAO, ...perfilExistente });

function obterPerfil() {
  return perfil;
}

async function salvarPerfil(perfilAtualizado) {
  const perfilSalvo = criarPerfil(perfilAtualizado);
  await fsPromises.writeFile(
    ARQUIVO_PERFIL,
    `${JSON.stringify(perfilSalvo, null, 2)}\n`
  );
  perfil = perfilSalvo;
  return perfil;
}

module.exports = { obterPerfil, salvarPerfil };
