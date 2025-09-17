const express = require("express");
const router = express.Router();
const temperatureController = require("../controllers/temperatureController");

router.post("/", temperatureController.addTemperature);
router.get("/:cowId/latest", temperatureController.getLatestTemperature);
router.get("/:cowId/history", temperatureController.getHistoryTemperature);
router.get("/:cowId/average", temperatureController.getAverageTemperature);
router.get("/:cowId/status", temperatureController.getSensorStatus);

module.exports = router;
