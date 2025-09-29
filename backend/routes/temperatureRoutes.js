const express = require('express');
const router = express.Router();
const temperatureController = require('../controllers/temperatureController');

// POST /api/temperature -> Menyimpan data baru
router.post('/', temperatureController.addTemperature);

// GET /api/temperature/:cowId/latest -> Data terakhir
router.get('/:cowId/latest', temperatureController.getLatestTemperature);

// GET /api/temperature/:cowId/history -> Riwayat data
router.get('/:cowId/history', temperatureController.getHistoryTemperature);

// GET /api/temperature/:cowId/average -> Rata-rata data
router.get('/:cowId/average', temperatureController.getAverageTemperature);

// GET /api/temperature/:cowId/status -> Status sensor online/offline
router.get('/:cowId/status', temperatureController.getSensorStatus);

module.exports = router;