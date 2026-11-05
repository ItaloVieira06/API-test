const perfilRepository = require("../repositories/perfilRepository");
const fotosPerfilRepository = require("../repositories/fotosPerfilRepository");
let filaImportacoes = Promise.resolve();

async function listarFotos(req, res) {
  try {
    res.json(await fotosPerfilRepository.listarFotos());
  } catch (erro) {
    console.error("Erro ao listar fotos de perfil:", erro);
    res.status(500).json({ erro: "Não foi possível carregar as fotos de perfil." });
  }
}

async function adicionarFotoNaFila(req, res) {
  try {
    const resultado = await fotosPerfilRepository.adicionarFoto(req.body || {});
    let fotoAtual = perfilRepository.obterPerfil().foto;
    if (resultado.removidas.includes(fotoAtual)) {
      fotoAtual = resultado.fotos[0].src;
      await perfilRepository.salvarFotoPerfil(fotoAtual);
    }

    res.status(201).json({ ...resultado, fotoAtual });
  } catch (erro) {
    if (erro.status === 400) {
      res.status(400).json({ erro: erro.message });
      return;
    }

    console.error("Erro ao salvar foto de perfil:", erro);
    res.status(500).json({ erro: "Não foi possível salvar a foto de perfil." });
  }
}

function adicionarFoto(req, res) {
  const operacao = filaImportacoes.then(() => adicionarFotoNaFila(req, res));
  filaImportacoes = operacao.then(() => undefined, () => undefined);
  return operacao;
}

async function selecionarFoto(req, res) {
  const { foto } = req.body || {};
  if (typeof foto !== "string") {
    res.status(400).json({ erro: "Informe uma foto de perfil válida." });
    return;
  }

  try {
    const fotos = await fotosPerfilRepository.listarFotos();
    if (!fotos.some((item) => item.src === foto)) {
      res.status(400).json({ erro: "A foto selecionada não está disponível." });
      return;
    }

    res.json(await perfilRepository.salvarFotoPerfil(foto));
  } catch (erro) {
    console.error("Erro ao selecionar foto de perfil:", erro);
    res.status(500).json({ erro: "Não foi possível selecionar a foto de perfil." });
  }
}

module.exports = { listarFotos, adicionarFoto, selecionarFoto };
