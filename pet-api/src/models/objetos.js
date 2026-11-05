/**
 * @typedef {Object} Disciplina
 * @property {number} id
 * @property {string} nome
 * @property {number} semestre
 */

/**
 * @typedef {Object} Endereco
 * @property {string} cep
 * @property {string} logradouro
 * @property {string} [numero]
 * @property {string} [complemento]
 * @property {string} bairro
 * @property {string} localidade
 * @property {string} uf
 */

/**
 * @typedef {Object} Perfil
 * @property {string} nome
 * @property {string} curso
 * @property {string} instituicao
 * @property {string} sobre
 * @property {string} email
 * @property {Endereco|null} endereco
 * @property {Object<string, {nome: string, url: string}>} redesSociais
 */

const REDES_SOCIAIS_PADRAO = Object.freeze({
  github: Object.freeze({ nome: "GitHub", url: "https://github.com/" }),
  instagram: Object.freeze({ nome: "Instagram", url: "https://www.instagram.com/" }),
  linkedin: Object.freeze({ nome: "LinkedIn", url: "https://www.linkedin.com/" })
});

const PERFIL_PADRAO = Object.freeze({
  nome: "Insira seu nome",
  curso: "Insira seu Curso",
  instituicao: "Insira sua Instituição",
  sobre: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since 1966 is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.",
  email: "",
  endereco: null,
  redesSociais: REDES_SOCIAIS_PADRAO
});

/**
 * @param {Partial<Perfil>} dados
 * @returns {Perfil}
 */
function criarPerfil(dados = {}) {
  const redesSociais = Object.fromEntries(
    Object.keys(REDES_SOCIAIS_PADRAO).map((chave) => {
      const rede = dados.redesSociais?.[chave];
      let urlValida;
      try {
        urlValida = new URL(rede?.url);
      } catch {
        urlValida = null;
      }
      const nome = typeof rede?.nome === "string" ? rede.nome.trim() : "";
      return [
        chave,
        nome && nome.length <= 40 && urlValida
          && ["http:", "https:"].includes(urlValida.protocol)
          ? { nome, url: urlValida.href }
          : REDES_SOCIAIS_PADRAO[chave]
      ];
    })
  );

  return {
    nome: typeof dados.nome === "string" && dados.nome.trim()
      ? dados.nome
      : PERFIL_PADRAO.nome,
    curso: typeof dados.curso === "string" && dados.curso.trim()
      ? dados.curso
      : PERFIL_PADRAO.curso,
    instituicao: typeof dados.instituicao === "string" && dados.instituicao.trim()
      ? dados.instituicao
      : PERFIL_PADRAO.instituicao,
    sobre: typeof dados.sobre === "string" ? dados.sobre : PERFIL_PADRAO.sobre,
    email: typeof dados.email === "string" ? dados.email.trim() : PERFIL_PADRAO.email,
    endereco: dados.endereco || null,
    redesSociais
  };
}

/**
 * @param {Partial<Endereco>} dados
 * @returns {Endereco}
 */
function criarEndereco(dados) {
  return {
    cep: dados.cep,
    logradouro: dados.logradouro,
    numero: dados.numero ?? "",
    complemento: dados.complemento ?? "",
    bairro: dados.bairro,
    localidade: dados.localidade,
    uf: dados.uf
  };
}

/**
 * @param {Disciplina} dados
 * @returns {Disciplina}
 */
function criarDisciplina(dados) {
  return {
    id: dados.id,
    nome: dados.nome,
    semestre: dados.semestre
  };
}

module.exports = {
  PERFIL_PADRAO,
  criarPerfil,
  criarEndereco,
  REDES_SOCIAIS_PADRAO,
  criarDisciplina
};
