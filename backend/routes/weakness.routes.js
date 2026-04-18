const express = require("express");
const router = express.Router();
const weaknessController = require("../controllers/weakness.controller");

router.post("/report", weaknessController.reportScore);
router.get("/:userId", weaknessController.getWeaknesses);

module.exports = router;
