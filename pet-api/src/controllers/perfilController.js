const perfilRepository = require("../repositories/perfilRepository");

function obterPerfil(req, res) {
  res.json(perfilRepository.obterPerfil());
}

async function atualizarPerfil(req, res) {
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
    await perfilRepository.salvarPerfil(perfilAtualizado);
    res.json(perfilAtualizado);
  } catch (erro) {
    console.error("Erro ao persistir perfil:", erro);
    res.status(500).json({ erro: "Não foi possível salvar o perfil." });
  }
}

module.exports = { obterPerfil, atualizarPerfil };
