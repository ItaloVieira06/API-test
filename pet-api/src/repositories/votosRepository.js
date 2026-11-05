const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const ARQUIVO_VOTOS = process.env.VOTOS_ARQUIVO
  || path.join(__dirname, "..", "..", "votos.json");
const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;
const MAXIMO_SESSOES_ATIVAS = 10000;
const DELTAS = { up: 1, down: -1 };
let filaOperacoes = Promise.resolve();

async function lerEstado() {
  let conteudo;
  try {
    conteudo = await fs.readFile(ARQUIVO_VOTOS, "utf8");
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return { pontuacao: 0, sessoes: {} };
    }
    throw erro;
  }

  const estado = JSON.parse(conteudo);
  if (!Number.isSafeInteger(estado.pontuacao)
    || !estado.sessoes || typeof estado.sessoes !== "object"
    || Array.isArray(estado.sessoes)) {
    throw new Error("O arquivo persistido de votos está inválido.");
  }

  for (const voto of Object.values(estado.sessoes)) {
    if (!voto || !Object.hasOwn(DELTAS, voto.escolha)
      || !Number.isFinite(voto.atualizadoEm)) {
      throw new Error("O arquivo persistido de votos está inválido.");
    }
  }
  return estado;
}

async function salvarEstado(estado) {
  await fs.mkdir(path.dirname(ARQUIVO_VOTOS), { recursive: true });
  const arquivoTemporario = `${ARQUIVO_VOTOS}.${randomUUID()}.tmp`;
  await fs.writeFile(arquivoTemporario, `${JSON.stringify(estado)}\n`, { flag: "wx" });
  await fs.rename(arquivoTemporario, ARQUIVO_VOTOS);
}

function expirarSessoes(estado, agora) {
  for (const [id, voto] of Object.entries(estado.sessoes)) {
    if (agora - voto.atualizadoEm > DURACAO_SESSAO_MS) {
      delete estado.sessoes[id];
    }
  }
}

function serializar(operacao) {
  const resultado = filaOperacoes.then(operacao);
  filaOperacoes = resultado.then(() => undefined, () => undefined);
  return resultado;
}

async function consultarPontuacao(idSessao) {
  const estado = await lerEstado();
  return {
    pontuacao: estado.pontuacao,
    voto: estado.sessoes[idSessao]?.escolha || null
  };
}

function registrarVoto(idSessao, escolha) {
  return serializar(async () => {
    const estado = await lerEstado();
    const agora = Date.now();
    expirarSessoes(estado, agora);
    const votoAnterior = estado.sessoes[idSessao]?.escolha || null;

    if (votoAnterior === escolha) {
      estado.pontuacao -= DELTAS[votoAnterior];
      delete estado.sessoes[idSessao];
    } else {
      if (!votoAnterior && !estado.sessoes[idSessao]
        && Object.keys(estado.sessoes).length >= MAXIMO_SESSOES_ATIVAS) {
        throw Object.assign(new Error("O limite temporário de sessões de voto foi atingido."), {
          status: 503
        });
      }

      const novaPontuacao = estado.pontuacao
        + DELTAS[escolha]
        - (votoAnterior ? DELTAS[votoAnterior] : 0);
      estado.pontuacao = novaPontuacao;
      estado.sessoes[idSessao] = { escolha, atualizadoEm: agora };
    }

    if (!Number.isSafeInteger(estado.pontuacao)) {
      throw Object.assign(new Error("A pontuação não pode ser atualizada."), { status: 503 });
    }

    await salvarEstado(estado);
    return {
      pontuacao: estado.pontuacao,
      voto: estado.sessoes[idSessao]?.escolha || null
    };
  });
}

module.exports = { consultarPontuacao, registrarVoto };
