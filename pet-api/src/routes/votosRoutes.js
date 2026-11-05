const express = require("express");
const votosController = require("../controllers/votosController");

const router = express.Router();

router.get("/", votosController.consultar);
router.post("/", votosController.votar);

module.exports = router;
