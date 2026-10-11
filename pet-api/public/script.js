const data = new Date();

const dia = String(data.getDate()).padStart(2, '0');
const mes = String(data.getMonth() + 1).padStart(2, '0');
const ano = data.getFullYear();

document.getElementById('data-atual').textContent =
    `${dia}/${mes}/${ano}`;

const botaoTema = document.getElementById("tema-btn");

botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("tema-escuro");

    if (document.body.classList.contains("tema-escuro")) {
        botaoTema.textContent = "☀️ Tema claro";
    } else {
        botaoTema.textContent = "🌙 Tema escuro";
    }
});

const upvote = document.getElementById("upvote");
const downvote = document.getElementById("downvote");
const contador = document.getElementById("contador");

let votos = 0;

upvote.addEventListener("click", function () {
    if (upvote.classList.contains("ativo")) {
        votos--;
        upvote.classList.remove("ativo");
    } else {
        votos++;

        upvote.classList.add("ativo");
        downvote.classList.remove("ativo");
    }

    contador.textContent = votos;
});

downvote.addEventListener("click", function () {
    if (downvote.classList.contains("ativo")) {
        votos++;
        downvote.classList.remove("ativo");
    } else {
        votos--;

        downvote.classList.add("ativo");
        upvote.classList.remove("ativo");
    }

    contador.textContent = votos;
});