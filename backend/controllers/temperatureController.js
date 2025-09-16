const temperatureModel = require("../models/temperatureModel");

exports.addTemperature = async (req, res) => {
  try {
    const { cow_id, temperature } = req.body;
    if (!cow_id || typeof temperature !== "number") {
      return res.status(400).json({ error: "cow_id and temperature required" });
    }
    const result = await temperatureModel.insert(cow_id, temperature);
    res.json({ ok: true, insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};

exports.getLatestTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const row = await temperatureModel.getLatest(cowId);
    res.json(row || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};

exports.getHistoryTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Math.min(500, Number(req.query.limit) || 50);
    const rows = await temperatureModel.getHistory(cowId, limit);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};

exports.getAverageTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const minutes = Number(req.query.minutes) || 60;
    const avgData = await temperatureModel.getAverage(cowId, minutes);
    res.json(avgData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};

// GET status sensor (aktif/tidak)
exports.getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);

    // ambil data terbaru
    const [[row]] = await pool.query(
      `SELECT created_at 
       FROM temperature_data 
       WHERE cow_id = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [cowId]
    );

    if (!row) {
      return res.json({ status: "offline", message: "Belum ada data dari sensor" });
    }

    // hitung selisih menit dari data terakhir
    const lastTime = new Date(row.created_at);
    const now = new Date();
    const diffMinutes = (now - lastTime) / 1000 / 60;

    if (diffMinutes > 2) {
      return res.json({ status: "offline", message: "Sensor tidak aktif / tidak terhubung" });
    }

    res.json({ status: "online", message: "Sensor aktif" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};
