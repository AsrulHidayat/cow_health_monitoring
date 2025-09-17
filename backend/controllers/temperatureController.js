const temperatureModel = require("../models/temperatureModel");

exports.addTemperature = async (req, res) => {
  try {
    console.log("📩 Data masuk:", req.body); // << debug
    const { cow_id, temperature } = req.body;

    if (!cow_id || typeof temperature !== "number") {
      return res.status(400).json({ error: "cow_id and temperature required" });
    }

    const result = await temperatureModel.insert(cow_id, temperature);
    console.log("✅ Insert berhasil:", result); // << debug
    res.json({ ok: true, insertedId: result.insertId });
  } catch (err) {
    console.error("❌ Error addTemperature:", err); // << debug
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
    const limit = Number(req.query.limit) || 60;
    const avgData = await temperatureModel.getAverage(cowId, limit);
    res.json(avgData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};

exports.getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
     console.log("Cek status sensor untuk cowId:", cowId);
    const lastUpdate = await temperatureModel.getLastUpdateTime(cowId);

    if (!lastUpdate) {
      return res.json({ status: "offline", message: "Belum ada data dari sensor" });
    }

    const diffMinutes = (new Date() - new Date(lastUpdate)) / 1000 / 60;
    const status = diffMinutes <= 5 ? "online" : "offline";
    const message = status === "online" ? "Sensor aktif" : "Sensor tidak aktif / tidak terhubung";

    res.json({ status, message, last_update: lastUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
};
