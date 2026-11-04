const express = require("express");
const disciplinasController = require("../controllers/disciplinasController");

const router = express.Router();

router.get("/", disciplinasController.listarDisciplinas);
router.get("/:id", disciplinasController.obterDisciplina);
router.post("/", disciplinasController.criarDisciplina);
router.put("/:id", disciplinasController.atualizarDisciplina);
router.delete("/:id", disciplinasController.excluirDisciplina);

module.exports = router;
