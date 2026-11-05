# Sistema Acadêmico — API de perfil, disciplinas e hobbies

Aplicação web simples para consultar e manter disciplinas, hobbies e informações de perfil acadêmico. A interface é servida pela própria API e usa o ViaCEP para consultar endereços pelo CEP.

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
│   ├── models/             # Contratos e fábricas dos objetos JSON
│   ├── repositories/       # Acesso e armazenamento dos dados
│   ├── routes/             # Rotas da API
│   ├── app.js              # Configuração do Express e rotas
│   └── server.js           # Inicialização do servidor
├── test/
│   ├── api.test.js         # Testes de integração
│   └── objetos.test.js     # Testes dos contratos e fábricas
├── package.json
└── perfil.json             # Persistência local, criada/atualizada pela API
```

Os typedefs JSDoc e as fábricas para `Perfil`, `Endereco`, `Disciplina` e `Hobby` ficam em `src/models/objetos.js`. Controllers e repositórios usam essas fábricas para manter a estrutura dos objetos JSON consistente.

## API

Todas as respostas da API são JSON. Nas requisições com corpo, envie o cabeçalho `Content-Type: application/json`. O parâmetro `:id` identifica um item e deve ser numérico.

### Disciplinas e hobbies

Ambos os recursos oferecem as mesmas operações CRUD. Use `/api/disciplinas` ou `/api/hobbies`, respectivamente:

| Operação | Rota | Corpo |
|---|---|---|
| Listar | `GET /api/{disciplinas\|hobbies}` | — |
| Consultar | `GET /api/{disciplinas\|hobbies}/:id` | — |
| Criar | `POST /api/{disciplinas\|hobbies}` | Disciplina: `nome`, `semestre`; hobby: `nome` |
| Atualizar | `PUT /api/{disciplinas\|hobbies}/:id` | Mesmos campos de criar |
| Excluir | `DELETE /api/{disciplinas\|hobbies}/:id` | — |

As rotas retornam `200` para consulta, atualização e exclusão, `201` ao criar, `400` para dados inválidos e `404` quando o item não existe. O nome é obrigatório, não pode ficar vazio e deve ter até 80 caracteres. Nas disciplinas, o semestre deve ser um inteiro maior que zero.

Exemplo de criação de disciplina:

```json
{
  "nome": "Banco de Dados",
  "semestre": 3
}
```

O nome enviado é removido de espaços nas extremidades. As respostas de disciplina seguem o formato:

```json
{
  "id": 1,
  "nome": "Banco de Dados",
  "semestre": 3
}
```

Os hobbies são exibidos como itens interativos no perfil. Use **Adicionar hobby** para criar um; clique em um hobby para editá-lo ou excluí-lo.

### Perfil

#### Consultar o perfil

`GET /api/perfil`

Retorna `200` e os dados atuais do perfil.

#### Atualizar o perfil

`PUT /api/perfil`

Envie `nome`, `curso`, `instituicao`, `sobre` e `endereco` no corpo:

```json
{
  "nome": "Nome da pessoa",
  "curso": "Jogos Digitais",
  "instituicao": "Centro Universitário Farias Brito",
  "sobre": "Texto de apresentação da pessoa.",
  "email": "pessoa@exemplo.com",
  "endereco": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "numero": "10",
    "complemento": "",
    "bairro": "Sé",
    "localidade": "São Paulo",
    "uf": "SP"
  },
  "redesSociais": {
    "github": {
      "nome": "GitHub",
      "url": "https://github.com/"
    },
    "instagram": {
      "nome": "Instagram",
      "url": "https://www.instagram.com/"
    },
    "linkedin": {
      "nome": "LinkedIn",
      "url": "https://www.linkedin.com/"
    }
  }
}
```

Retorna `200` e o perfil atualizado. `nome`, `curso` e `instituicao` são obrigatórios e não podem ficar vazios; caso contrário, a API retorna `400`. Se ocorrer uma falha ao salvar o arquivo, retorna `500`.
Na interface, clique no nome, no curso ou na instituição para editá-los; o botão **Salvar** aparece durante a edição. O curso e a instituição são exibidos na mesma linha, separados por hífen, e podem ser editados independentemente. Ao editar a instituição, o link de pesquisa Google é atualizado com o nome informado e termos para localizar endereço, site ou portal oficial. A pessoa confere os resultados manualmente; a aplicação não consulta o Google nem confirma automaticamente a existência da instituição. A pesquisa é apenas um auxílio e não impede o salvamento. Os valores são removidos de espaços nas extremidades, e valores vazios ou compostos apenas por espaços são rejeitados tanto na interface quanto pela API.

O texto **Sobre** também é editável e é persistido no perfil, permanecendo após recarregar ou reiniciar o servidor. Se `sobre` for omitido em uma atualização, o valor salvo anteriormente é mantido.

`redesSociais` é opcional. Se omitido, os links previamente salvos são mantidos; em um perfil novo, são usados os endereços oficiais de GitHub, Instagram e LinkedIn. Cada rede deve conter `nome` (de 1 a 40 caracteres) e `url` HTTP ou HTTPS (até 2048 caracteres); dados inválidos retornam `400`. Na interface, clique em **Editar** abaixo de um botão social para alterar seu nome e link. As alterações são persistidas no perfil.

`email` é opcional para atualizações da API; quando omitido, o valor salvo é mantido. Se informado, deve estar vazio ou ser um endereço válido com até 254 caracteres. Na interface, use **Editar** abaixo de **Entrar em contato** para definir o email do perfil. O botão de contato abre um formulário e prepara a mensagem no aplicativo de email padrão; a pessoa deve revisar e confirmar o envio nesse aplicativo. A aplicação não envia emails diretamente nem simula confirmação de envio.

Na interface, clique na foto de perfil para abrir a galeria. É possível selecionar uma imagem existente ou importar PNG, JPEG, GIF, WebP, BMP ou AVIF de até 5 MB; a escolha só é aplicada ao perfil depois de clicar em **Salvar foto**. O diretório `public/assets/` mantém no máximo cinco imagens, removendo a mais antiga quando uma nova excede o limite.

As fotos podem ser consultadas em `GET /api/perfil/fotos`, importadas em `POST /api/perfil/fotos` (JSON com `tipo` MIME e `base64`) e selecionadas em `PUT /api/perfil/foto` (JSON com `foto`, o caminho da imagem). O perfil inclui esse caminho no campo `foto`.

`endereco` é opcional: pode ser omitido ou enviado como `null`. Quando informado, deve ser um objeto com:

- `cep`: oito dígitos, com ou sem hífen (por exemplo, `01001000` ou `01001-000`); a API o armazena no formato `00000-000`.
- `logradouro`, `bairro` e `localidade`: textos obrigatórios e não vazios.
- `uf`: sigla de duas letras; a API a armazena em maiúsculas.
- `numero` e `complemento`: textos opcionais, armazenados sem espaços nas extremidades.

Um endereço com formato inválido retorna `400`. Na interface, os dados são preenchidos pela consulta ao ViaCEP.

## Persistência e configuração

- **Perfil:** salvo em `pet-api/perfil.json` e mantido entre reinicializações. Esse arquivo local é ignorado pelo Git. Para escolher outro caminho, defina `PERFIL_ARQUIVO` no ambiente antes de iniciar o servidor.
- **Perfil sem dados pré-carregados:** nome, curso e instituição começam com **Insira seu nome**, **Insira seu Curso** e **Insira sua Instituição**. O endereço começa vazio e pode ser adicionado pelo botão. As alterações do perfil são gravadas em `pet-api/perfil.json` e permanecem após recarregar ou reiniciar a aplicação.
- **Disciplinas e hobbies:** mantidos somente em memória; alterações são perdidas quando o processo do servidor é reiniciado.
- **Porta:** `PORT`, com padrão `3000`.
- **CEP:** a consulta é feita pelo navegador ao serviço externo ViaCEP; é necessária conexão à internet para essa funcionalidade.

O projeto é uma aplicação acadêmica/local: não possui autenticação nem banco de dados para disciplinas ou hobbies.
