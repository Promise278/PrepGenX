const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parent.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.get("/dashboard/:userId", parentController.viewDashboard);
router.post("/connect", verifyToken, parentController.connectParent);

module.exports = router;
