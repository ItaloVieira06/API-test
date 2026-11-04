export async function mensagemDeErro(resposta) {
  let mensagem = resposta.statusText || "Erro na requisição";
  if (resposta.headers.get("content-type")?.includes("application/json")) {
    const corpo = await resposta.json();
    mensagem = corpo.erro || corpo.message || mensagem;
  }

  return `Erro ${resposta.status}: ${mensagem}`;
}

export async function requisitarJson(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  if (!resposta.ok) {
    throw new Error(await mensagemDeErro(resposta));
  }

  return resposta.json();
}
