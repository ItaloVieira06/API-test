# API test

## Executar a API

No terminal, entre na pasta `pet-api`, instale as dependências e inicie o servidor:

```powershell
cd pet-api
npm install
npm run dev
```

O servidor fica disponível em `http://localhost:3000`.

## Estrutura do projeto

```text
pet-api/
├── public/
│   ├── assets/
│   ├── js/                  # Módulos da interface
│   ├── index.html
│   └── style.css
└── src/
    ├── controllers/         # Validação e respostas HTTP
    ├── repositories/        # Acesso e armazenamento dos dados
    ├── routes/              # Rotas da API
    ├── app.js               # Configuração do Express
    └── server.js            # Inicialização do servidor
```

## Disciplinas

Use **+ Adicionar disciplina** para abrir o formulário. Clique em uma disciplina para editá-la; a janela pode ser fechada pelo botão **×**, pela tecla Esc ou clicando fora dela. A API usa `GET` e `POST` em `/api/disciplinas` e `PUT` e `DELETE` em `/api/disciplinas/:id`.

Use **Informar endereço** abaixo das informações do curso para buscar um CEP pelo ViaCEP e salvar rua, número, complemento (opcional), bairro, cidade e UF no perfil. O perfil é gravado em `pet-api/perfil.json` para continuar disponível após recarregar a página ou reiniciar o servidor. Esse arquivo local é ignorado pelo Git.

Ao abrir a página, perfil e disciplinas são carregados em paralelo com `Promise.all`. O indicador **Carregando...** permanece visível até as duas requisições terminarem.
