const express = require("express");
const hobbiesController = require("../controllers/hobbiesController");

const router = express.Router();

router.get("/", hobbiesController.listarHobbies);
router.get("/:id", hobbiesController.obterHobby);
router.post("/", hobbiesController.criarHobby);
router.put("/:id", hobbiesController.atualizarHobby);
router.delete("/:id", hobbiesController.excluirHobby);

module.exports = router;
