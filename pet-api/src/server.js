const fs = require("node:fs");
const https = require("node:https");
const app = require("./app");

const PORTA = Number(process.env.PORT) || 3010;
const CERTIFICADO_HTTPS = process.env.HTTPS_CERT;
const CHAVE_HTTPS = process.env.HTTPS_KEY;

if (Boolean(CERTIFICADO_HTTPS) !== Boolean(CHAVE_HTTPS)) {
  throw new Error("Configure HTTPS_CERT e HTTPS_KEY juntos para iniciar com HTTPS.");
}

const servidor = CERTIFICADO_HTTPS
  ? https.createServer({
    cert: fs.readFileSync(CERTIFICADO_HTTPS),
    key: fs.readFileSync(CHAVE_HTTPS)
  }, app)
  : app;

const protocolo = CERTIFICADO_HTTPS ? "https" : "http";

servidor.listen(PORTA, () => {
  console.log(`Servidor rodando em ${protocolo}://localhost:${PORTA}`);
});
