const perfilRepository = require("../repositories/perfilRepository");
const {
  criarEndereco,
  criarPerfil,
  REDES_SOCIAIS_PADRAO
} = require("../models/objetos");

function validarRedesSociais(redesSociais, res) {
  if (typeof redesSociais !== "object" || redesSociais === null
    || Array.isArray(redesSociais)) {
    res.status(400).json({ erro: "O campo redesSociais deve ser um objeto" });
    return undefined;
  }

  const redesSociaisValidadas = {};
  for (const chave of Object.keys(REDES_SOCIAIS_PADRAO)) {
    const rede = redesSociais[chave];
    if (typeof rede !== "object" || rede === null || Array.isArray(rede)) {
      res.status(400).json({ erro: `A rede social ${chave} deve conter nome e url` });
      return undefined;
    }

    const nome = typeof rede.nome === "string" ? rede.nome.trim() : "";
    if (!nome || nome.length > 40) {
      res.status(400).json({
        erro: `O nome da rede social ${chave} deve ter entre 1 e 40 caracteres`
      });
      return undefined;
    }

    const url = typeof rede.url === "string" ? rede.url.trim() : "";
    let urlValida;
    try {
      urlValida = new URL(url);
    } catch {
      res.status(400).json({ erro: `O link da rede social ${chave} deve ser uma URL válida` });
      return undefined;
    }
    if (!["http:", "https:"].includes(urlValida.protocol) || url.length > 2048) {
      res.status(400).json({
        erro: `O link da rede social ${chave} deve usar http ou https e ter até 2048 caracteres`
      });
      return undefined;
    }

    redesSociaisValidadas[chave] = { nome, url };
  }

  return redesSociaisValidadas;
}

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
  return criarEndereco({
    cep: `${cepNumerico.slice(0, 5)}-${cepNumerico.slice(5)}`,
    logradouro: logradouro.trim(),
    numero: typeof numero === "string" ? numero.trim() : "",
    complemento: typeof complemento === "string" ? complemento.trim() : "",
    bairro: bairro.trim(),
    localidade: localidade.trim(),
    uf: uf.trim().toUpperCase()
  });
}

function obterPerfil(req, res) {
  res.json(perfilRepository.obterPerfil());
}

async function atualizarPerfil(req, res) {
  const { nome, curso, instituicao, sobre, email, endereco, redesSociais } = req.body || {};
  if (typeof nome !== "string" || !nome.trim()) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }
  if (typeof curso !== "string" || !curso.trim()) {
    return res.status(400).json({ erro: "O campo curso é obrigatório" });
  }
  if (typeof instituicao !== "string" || !instituicao.trim()) {
    return res.status(400).json({ erro: "O campo instituicao é obrigatório" });
  }
  const sobreAtualizado = sobre === undefined
    ? perfilRepository.obterPerfil().sobre
    : sobre;
  if (typeof sobreAtualizado !== "string") {
    return res.status(400).json({ erro: "O campo sobre deve ser um texto" });
  }
  const emailAtualizado = email === undefined
    ? perfilRepository.obterPerfil().email
    : email;
  if (typeof emailAtualizado !== "string" || emailAtualizado.length > 254
    || (emailAtualizado.trim()
      && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailAtualizado.trim()))) {
    return res.status(400).json({
      erro: "O campo email deve ser um endereço válido com até 254 caracteres"
    });
  }
  const enderecoSalvo = validarEndereco(endereco, res);
  if (enderecoSalvo === undefined) {
    return;
  }
  const redesSociaisSalvas = redesSociais === undefined
    ? perfilRepository.obterPerfil().redesSociais
    : validarRedesSociais(redesSociais, res);
  if (redesSociaisSalvas === undefined) {
    return;
  }

  const perfilAtualizado = criarPerfil({
    nome: nome.trim(),
    curso: curso.trim(),
    instituicao: instituicao.trim(),
    sobre: sobreAtualizado.trim(),
    email: emailAtualizado.trim(),
    foto: perfilRepository.obterPerfil().foto,
    endereco: enderecoSalvo,
    redesSociais: redesSociaisSalvas
  });

  try {
    await perfilRepository.salvarPerfil(perfilAtualizado);
    res.json(perfilAtualizado);
  } catch (erro) {
    console.error("Erro ao persistir perfil:", erro);
    res.status(500).json({ erro: "Não foi possível salvar o perfil." });
  }
}

module.exports = { obterPerfil, atualizarPerfil };
