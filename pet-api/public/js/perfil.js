import { mensagemDeErro, requisitarJson } from "./api.js";

const modalEndereco = document.getElementById("modal-endereco");
const formularioEndereco = document.getElementById("form-endereco");
const cepEndereco = document.getElementById("cep-endereco");
const botaoBuscarCep = document.getElementById("buscar-cep");
const botaoSalvarEndereco = document.getElementById("salvar-endereco");
const statusEndereco = document.getElementById("status-endereco");
const enderecoVisivel = document.getElementById("cep-salvo");

let perfilAtual = null;
let enderecoConsultado = null;

function atualizarEnderecoVisivel(perfil) {
  const endereco = perfil?.endereco;
  const camposEndereco = [
    [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", "),
    [endereco?.complemento, endereco?.bairro].filter(Boolean).join(" - "),
    [endereco?.localidade, endereco?.uf].filter(Boolean).join(" - "),
    endereco?.cep ? `CEP: ${endereco.cep}` : ""
  ].filter(Boolean);

  enderecoVisivel.hidden = camposEndereco.length === 0;
  enderecoVisivel.textContent = camposEndereco.join(", ");
}

function preencherFormularioEndereco(endereco) {
  formularioEndereco.elements.cep.value = endereco?.cep || "";
  formularioEndereco.elements.logradouro.value = endereco?.logradouro || "";
  formularioEndereco.elements.numero.value = endereco?.numero || "";
  formularioEndereco.elements.complemento.value = endereco?.complemento || "";
  formularioEndereco.elements.bairro.value = endereco?.bairro || "";
  formularioEndereco.elements.localidade.value = endereco?.localidade || "";
  formularioEndereco.elements.uf.value = endereco?.uf || "";

  enderecoConsultado = endereco?.logradouro && endereco?.bairro
    && endereco?.localidade && endereco?.uf
    ? endereco
    : null;
  botaoSalvarEndereco.disabled = !perfilAtual || !enderecoConsultado;
}

async function abrirModalEndereco() {
  modalEndereco.showModal();
  statusEndereco.textContent = "";
  enderecoConsultado = null;
  botaoSalvarEndereco.disabled = true;

  try {
    perfilAtual = await requisitarJson("/api/perfil");
    atualizarEnderecoVisivel(perfilAtual);
    preencherFormularioEndereco(perfilAtual.endereco);
    cepEndereco.focus();
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível carregar o perfil.";
  }
}

async function buscarEnderecoPorCep() {
  const cep = cepEndereco.value.replace(/\D/g, "");
  statusEndereco.textContent = "";
  enderecoConsultado = null;
  botaoSalvarEndereco.disabled = true;

  if (cep.length !== 8) {
    const mensagem = "Informe um CEP válido com 8 números.";
    console.error("Erro ao consultar CEP:", mensagem);
    statusEndereco.textContent = mensagem;
    return;
  }

  botaoBuscarCep.disabled = true;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (resposta.status === 400) {
      throw new Error("Formato de CEP inválido. Informe um CEP com 8 números.");
    }
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao consultar o ViaCEP.`);
    }

    const endereco = await resposta.json();
    if (endereco.erro) {
      throw new Error("CEP não encontrado.");
    }

    preencherFormularioEndereco({
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: formularioEndereco.elements.numero.value,
      complemento: formularioEndereco.elements.complemento.value,
      bairro: endereco.bairro,
      localidade: endereco.localidade,
      uf: endereco.uf
    });

    if (!enderecoConsultado) {
      statusEndereco.textContent = "O ViaCEP não retornou todos os campos do endereço.";
      return;
    }
    statusEndereco.textContent = "Endereço encontrado.";
  } catch (erro) {
    console.error("Erro ao consultar CEP:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível consultar o CEP.";
  } finally {
    botaoBuscarCep.disabled = false;
  }
}

async function salvarEndereco(evento) {
  evento.preventDefault();
  if (!perfilAtual || !enderecoConsultado) {
    statusEndereco.textContent = "Busque um CEP válido antes de salvar o endereço.";
    return;
  }

  statusEndereco.textContent = "";
  botaoSalvarEndereco.disabled = true;

  try {
    await requisitarJson("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: perfilAtual.nome,
        curso: perfilAtual.curso,
        endereco: {
          ...enderecoConsultado,
          numero: formularioEndereco.elements.numero.value.trim(),
          complemento: formularioEndereco.elements.complemento.value.trim()
        }
      })
    });

    perfilAtual = await requisitarJson("/api/perfil");
    atualizarEnderecoVisivel(perfilAtual);
    statusEndereco.textContent = "Endereço salvo no perfil.";
    modalEndereco.close();
  } catch (erro) {
    console.error("Erro ao salvar endereço:", erro);
    statusEndereco.textContent = erro instanceof Error
      ? erro.message
      : "Não foi possível salvar o endereço.";
  } finally {
    botaoSalvarEndereco.disabled = false;
  }
}

document.getElementById("abrir-modal-endereco")
  .addEventListener("click", abrirModalEndereco);

document.getElementById("fechar-modal-endereco")
  .addEventListener("click", () => modalEndereco.close());

modalEndereco.addEventListener("click", (evento) => {
  if (evento.target === modalEndereco) {
    modalEndereco.close();
  }
});

botaoBuscarCep.addEventListener("click", buscarEnderecoPorCep);
formularioEndereco.addEventListener("submit", salvarEndereco);

export async function carregarPerfil() {
  try {
    perfilAtual = await requisitarJson("/api/perfil");
    atualizarEnderecoVisivel(perfilAtual);
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}
