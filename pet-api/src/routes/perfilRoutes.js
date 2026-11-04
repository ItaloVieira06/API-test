const express = require("express");
const perfilController = require("../controllers/perfilController");

const router = express.Router();

router.get("/", perfilController.obterPerfil);
router.put("/", perfilController.atualizarPerfil);

module.exports = router;
