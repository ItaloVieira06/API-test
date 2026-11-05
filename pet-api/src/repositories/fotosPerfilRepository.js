const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const DIRETORIO_ASSETS = process.env.PERFIL_ASSETS_DIRETORIO
  || path.join(__dirname, "..", "..", "public", "assets");
const LIMITE_FOTOS = 5;
const LIMITE_BYTES = 5 * 1024 * 1024;
const FORMATOS_IMAGEM = {
  "image/png": { extensao: "png", validar: (dados) =>
    dados.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/jpeg": { extensao: "jpg", validar: (dados) =>
    dados[0] === 0xff && dados[1] === 0xd8 && dados[2] === 0xff },
  "image/gif": { extensao: "gif", validar: (dados) =>
    ["GIF87a", "GIF89a"].includes(dados.toString("ascii", 0, 6)) },
  "image/webp": { extensao: "webp", validar: (dados) =>
    dados.toString("ascii", 0, 4) === "RIFF"
      && dados.toString("ascii", 8, 12) === "WEBP" },
  "image/bmp": { extensao: "bmp", validar: (dados) =>
    dados.toString("ascii", 0, 2) === "BM" },
  "image/avif": { extensao: "avif", validar: (dados) =>
    dados.toString("ascii", 4, 8) === "ftyp"
      && ["avif", "avis"].includes(dados.toString("ascii", 8, 12)) }
};

async function listarFotos() {
  const entradas = await fs.readdir(DIRETORIO_ASSETS, { withFileTypes: true })
    .catch((erro) => {
      if (erro.code === "ENOENT") {
        return [];
      }
      throw erro;
    });

  const fotos = await Promise.all(entradas
    .filter((entrada) => entrada.isFile()
      && /\.(?:png|jpe?g|gif|webp|bmp|avif)$/i.test(entrada.name))
    .map(async (entrada) => {
      const caminho = path.join(DIRETORIO_ASSETS, entrada.name);
      const metadados = await fs.stat(caminho);
      return {
        nome: entrada.name,
        src: `/assets/${encodeURIComponent(entrada.name)}`,
        modificadoEm: metadados.mtimeMs
      };
    }));

  return fotos.sort((a, b) => a.modificadoEm - b.modificadoEm || a.nome.localeCompare(b.nome));
}

async function adicionarFoto({ tipo, base64 }) {
  const formato = FORMATOS_IMAGEM[tipo];
  if (!formato || typeof base64 !== "string"
    || base64.length > Math.ceil(LIMITE_BYTES * 4 / 3) + 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
    throw Object.assign(
      new Error("Envie uma imagem PNG, JPEG, GIF, WebP, BMP ou AVIF válida de até 5 MB."),
      { status: 400 }
    );
  }

  const dados = Buffer.from(base64, "base64");
  if (dados.length === 0 || dados.length > LIMITE_BYTES
    || dados.toString("base64") !== base64 || !formato.validar(dados)) {
    throw Object.assign(
      new Error("O arquivo não corresponde a uma imagem válida ou excede 5 MB."),
      { status: 400 }
    );
  }

  await fs.mkdir(DIRETORIO_ASSETS, { recursive: true });
  const nome = `perfil-${Date.now()}-${randomUUID()}.${formato.extensao}`;
  await fs.writeFile(path.join(DIRETORIO_ASSETS, nome), dados, { flag: "wx" });

  const fotos = await listarFotos();
  const removidas = [];
  while (fotos.length > LIMITE_FOTOS) {
    const maisAntiga = fotos.shift();
    await fs.unlink(path.join(DIRETORIO_ASSETS, maisAntiga.nome));
    removidas.push(maisAntiga.src);
  }

  return {
    foto: `/assets/${encodeURIComponent(nome)}`,
    removidas,
    fotos: await listarFotos()
  };
}

module.exports = { adicionarFoto, listarFotos };
