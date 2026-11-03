# API test

## Executar a API

No terminal, entre na pasta `pet-api`, instale as dependências e inicie o servidor:

```powershell
cd pet-api
npm install
npm run dev
```

O servidor fica disponível em `http://localhost:3000`.

## Disciplinas

Use **+ Adicionar disciplina** para abrir o formulário. Clique em uma disciplina para editá-la; a janela pode ser fechada pelo botão **×**, pela tecla Esc ou clicando fora dela. A API usa `GET` e `POST` em `/api/disciplinas` e `PUT` e `DELETE` em `/api/disciplinas/:id`.
