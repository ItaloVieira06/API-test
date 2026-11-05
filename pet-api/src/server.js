const app = require("./app");

const PORTA = Number(process.env.PORT) || 3010;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
