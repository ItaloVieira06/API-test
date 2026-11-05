const express = require("express");
const perfilController = require("../controllers/perfilController");
const fotosPerfilController = require("../controllers/fotosPerfilController");

const router = express.Router();

router.get("/fotos", fotosPerfilController.listarFotos);
router.post("/fotos", fotosPerfilController.adicionarFoto);
router.put("/foto", fotosPerfilController.selecionarFoto);
router.get("/", perfilController.obterPerfil);
router.put("/", perfilController.atualizarPerfil);

module.exports = router;
