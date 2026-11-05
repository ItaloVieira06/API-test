const votosRepository = require("../repositories/votosRepository");

const ID_SESSAO_VALIDO = /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

function obterIdSessao(req, res) {
  const idSessao = req.get("x-voter-id");
  if (typeof idSessao !== "string" || !ID_SESSAO_VALIDO.test(idSessao)) {
    res.status(400).json({ erro: "Identificador de sessão inválido." });
    return null;
  }
  return idSessao;
}

async function consultar(req, res) {
  const idSessao = obterIdSessao(req, res);
  if (!idSessao) {
    return;
  }

  try {
    res.json(await votosRepository.consultarPontuacao(idSessao));
  } catch (erro) {
    console.error("Falha ao consultar os votos:", erro);
    res.status(500).json({ erro: "Não foi possível consultar a votação." });
  }
}

async function votar(req, res) {
  const idSessao = obterIdSessao(req, res);
  if (!idSessao) {
    return;
  }

  const { voto } = req.body || {};
  if (voto !== "up" && voto !== "down") {
    return res.status(400).json({ erro: "O voto deve ser 'up' ou 'down'." });
  }

  try {
    res.json(await votosRepository.registrarVoto(idSessao, voto));
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    console.error("Falha ao registrar o voto:", erro);
    res.status(500).json({ erro: "Não foi possível registrar o voto." });
  }
}

module.exports = { consultar, votar };
