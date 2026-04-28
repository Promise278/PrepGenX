const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parent.controller");
const verifyToken = require("../middlewares/auth.middleware");

// Public routes (accessible via share token or JWT)
router.get("/dashboard/:userId", parentController.viewDashboard);
router.get("/child/:userId/overview", parentController.getChildOverview);
router.get("/child/:userId/weaknesses", parentController.getChildWeaknesses);
router.get("/child/:userId/exam-history", parentController.getChildExamHistory);
router.get("/child/:userId/study-activity", parentController.getChildStudyActivity);
router.get("/child/:userId/report-card", parentController.getChildReportCard);

// Authenticated routes (student only)
router.post("/connect", verifyToken, parentController.connectParent);
router.post("/share-token", verifyToken, parentController.generateShareToken);

module.exports = router;
