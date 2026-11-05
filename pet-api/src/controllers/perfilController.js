const perfilRepository = require("../repositories/perfilRepository");

function validarEndereco(endereco, res) {
  if (endereco == null) {
    return null;
  }
  if (typeof endereco !== "object" || Array.isArray(endereco)) {
    res.status(400).json({ erro: "O campo endereco deve ser um objeto ou null" });
    return undefined;
  }

  const { cep, logradouro, numero, complemento, bairro, localidade, uf } = endereco;
  if (typeof cep !== "string" || !/^\d{5}-?\d{3}$/.test(cep.trim())) {
    res.status(400).json({ erro: "O campo endereco.cep deve conter 8 dígitos" });
    return undefined;
  }
  for (const [campo, valor] of Object.entries({ logradouro, bairro, localidade })) {
    if (typeof valor !== "string" || !valor.trim()) {
      res.status(400).json({ erro: `O campo endereco.${campo} é obrigatório` });
      return undefined;
    }
  }
  if (typeof uf !== "string" || !/^[a-z]{2}$/i.test(uf.trim())) {
    res.status(400).json({ erro: "O campo endereco.uf deve conter 2 letras" });
    return undefined;
  }
  for (const [campo, valor] of Object.entries({ numero, complemento })) {
    if (valor !== undefined && typeof valor !== "string") {
      res.status(400).json({ erro: `O campo endereco.${campo} deve ser um texto` });
      return undefined;
    }
  }

  const cepNumerico = cep.replace(/\D/g, "");
  return {
    cep: `${cepNumerico.slice(0, 5)}-${cepNumerico.slice(5)}`,
    logradouro: logradouro.trim(),
    numero: typeof numero === "string" ? numero.trim() : "",
    complemento: typeof complemento === "string" ? complemento.trim() : "",
    bairro: bairro.trim(),
    localidade: localidade.trim(),
    uf: uf.trim().toUpperCase()
  };
}

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

  const enderecoSalvo = validarEndereco(endereco, res);
  if (enderecoSalvo === undefined) {
    return;
  }

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
