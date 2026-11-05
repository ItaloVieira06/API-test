const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");

const ARQUIVO_PERFIL = process.env.PERFIL_ARQUIVO
  || path.join(__dirname, "..", "..", "perfil.json");
const perfilPadrao = {
  nome: "Ítalo do Espírito Santo Vieira",
  curso: "Jogos Digitais",
  endereco: null
};

let perfil = fs.existsSync(ARQUIVO_PERFIL)
  ? { ...perfilPadrao, ...JSON.parse(fs.readFileSync(ARQUIVO_PERFIL, "utf8")) }
  : perfilPadrao;

function obterPerfil() {
  return perfil;
}

async function salvarPerfil(perfilAtualizado) {
  await fsPromises.writeFile(
    ARQUIVO_PERFIL,
    `${JSON.stringify(perfilAtualizado, null, 2)}\n`
  );
  perfil = perfilAtualizado;
  return perfil;
}

module.exports = { obterPerfil, salvarPerfil };
