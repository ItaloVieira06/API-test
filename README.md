# Sistema Acadêmico — API de perfil e disciplinas

Aplicação web simples para consultar e manter disciplinas e informações de perfil acadêmico. A interface é servida pela própria API e usa o ViaCEP para consultar endereços pelo CEP.

## Tecnologias e requisitos

- Node.js 18 ou superior (inclui suporte ao Express 5 e à API `fetch` usada nos testes).
- npm.
- Express 5.
- HTML, CSS e JavaScript no navegador, sem framework de interface.

## Instalação e execução

No PowerShell, a partir da raiz do repositório:

```powershell
cd pet-api
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`. `npm start` inicia o mesmo servidor. A porta padrão pode ser alterada pela variável de ambiente `PORT`:

```powershell
$env:PORT = "3002"
npm start
```

Abra a URL do servidor para usar a interface. O diretório `public/` contém os arquivos estáticos e `src/server.js` inicia o servidor Express.

## Testes

Execute os testes automatizados de integração da API com:

```powershell
npm test
```

Os testes cobrem a interface servida, as rotas de disciplinas e perfil, validações e persistência do perfil. Eles usam um arquivo temporário e não alteram `pet-api/perfil.json`.

## Estrutura

```text
pet-api/
├── public/                 # Interface web
│   ├── assets/
│   ├── js/                 # Módulos da interface e chamadas à API
│   ├── index.html
│   └── style.css
├── src/
│   ├── controllers/        # Validação e respostas HTTP
│   ├── repositories/       # Acesso e armazenamento dos dados
│   ├── routes/             # Rotas da API
│   ├── app.js              # Configuração do Express e rotas
│   └── server.js           # Inicialização do servidor
├── test/
│   └── api.test.js         # Testes de integração
├── package.json
└── perfil.json             # Persistência local, criada/atualizada pela API
```

## API

Todas as respostas da API são JSON. Para requisições com corpo, envie `Content-Type: application/json`. `:id` é o identificador numérico da disciplina.

### Disciplinas

| Método | Caminho | Corpo | Sucesso | Erros principais |
|---|---|---|---|---|
| `GET` | `/api/disciplinas` | — | `200`: lista de disciplinas | — |
| `GET` | `/api/disciplinas/:id` | — | `200`: disciplina | `404`: disciplina inexistente |
| `POST` | `/api/disciplinas` | `{"nome":"Banco de Dados","semestre":3}` | `201`: disciplina criada | `400`: nome ausente/vazio ou semestre inválido |
| `PUT` | `/api/disciplinas/:id` | `{"nome":"Banco de Dados","semestre":4}` | `200`: disciplina atualizada | `400`: dados inválidos; `404`: disciplina inexistente |
| `DELETE` | `/api/disciplinas/:id` | — | `200`: disciplina removida | `404`: disciplina inexistente |

O nome é removido de espaços nas extremidades. `semestre` deve ser um número inteiro maior que zero. Cada disciplina tem o formato `{"id":1,"nome":"Banco de Dados","semestre":3}`.

### Perfil

| Método | Caminho | Corpo | Sucesso | Erros principais |
|---|---|---|---|---|
| `GET` | `/api/perfil` | — | `200`: perfil atual | — |
| `PUT` | `/api/perfil` | Ver exemplo abaixo | `200`: perfil atualizado e salvo | `400`: nome ou curso ausente/vazio; `500`: falha ao gravar o arquivo |

Exemplo de corpo para atualizar o perfil:

```json
{
  "nome": "Nome da pessoa",
  "curso": "Jogos Digitais",
  "endereco": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "numero": "10",
    "complemento": "",
    "bairro": "Sé",
    "localidade": "São Paulo",
    "uf": "SP"
  }
}
```

`nome` e `curso` são obrigatórios e não podem ficar vazios. `endereco` pode ser `null`; a interface preenche seus campos a partir do ViaCEP. `numero` e `complemento` são opcionais e, quando enviados como texto, têm espaços nas extremidades removidos.

## Persistência e configuração

- **Perfil:** salvo em `pet-api/perfil.json` e mantido entre reinicializações. Esse arquivo local é ignorado pelo Git. Para escolher outro caminho, defina `PERFIL_ARQUIVO` no ambiente antes de iniciar o servidor.
- **Disciplinas:** mantidas somente em memória; alterações são perdidas quando o processo do servidor é reiniciado.
- **Porta:** `PORT`, com padrão `3000`.
- **CEP:** a consulta é feita pelo navegador ao serviço externo ViaCEP; é necessária conexão à internet para essa funcionalidade.

O projeto é uma aplicação acadêmica/local: não possui autenticação nem banco de dados para as disciplinas.
