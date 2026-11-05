const express = require("express");
const path = require("node:path");
const disciplinasRoutes = require("./routes/disciplinasRoutes");
const hobbiesRoutes = require("./routes/hobbiesRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const votosRoutes = require("./routes/votosRoutes");

const app = express();

app.use(express.json({ limit: "7mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/hobbies", hobbiesRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/votos", votosRoutes);

module.exports = app;
