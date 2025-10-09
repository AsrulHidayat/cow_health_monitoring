import Temperature from "../models/temperatureModel.js"; 

// ✅ Tambah data suhu baru
export const addTemperature = async (req, res) => {
  try {
    console.log("📩 Data masuk:", req.body);
    const { cow_id, temperature } = req.body;

    if (!cow_id || typeof temperature !== "number") {
      return res.status(400).json({ error: "cow_id dan temperature wajib diisi" });
    }

    const newTemp = await Temperature.create({
      cow_id,
      temperature,
      created_at: new Date(), // otomatis timestamp
    });

    console.log("✅ Insert berhasil:", newTemp.toJSON());
    res.status(201).json({ ok: true, insertedId: newTemp.id });
  } catch (err) {
    console.error("❌ Error addTemperature:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil data suhu terbaru
export const getLatestTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const latest = await Temperature.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    res.json(latest || null);
  } catch (err) {
    console.error("❌ getLatestTemperature error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil riwayat suhu
export const getHistoryTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Math.min(500, Number(req.query.limit) || 50);

    const history = await Temperature.findAll({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
      limit,
    });

    res.json(history);
  } catch (err) {
    console.error("❌ getHistoryTemperature error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Hitung rata-rata suhu (misal dari N data terakhir)
export const getAverageTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Number(req.query.limit) || 60;

    const temps = await Temperature.findAll({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
      limit,
    });

    if (temps.length === 0) return res.json({ average: null });

    const avg =
      temps.reduce((sum, t) => sum + t.temperature, 0) / temps.length;

    res.json({ cow_id: cowId, average: avg });
  } catch (err) {
    console.error("❌ getAverageTemperature error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Cek status sensor (online/offline)
export const getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    console.log("Cek status sensor untuk cowId:", cowId);

    const lastData = await Temperature.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    if (!lastData) {
      return res.json({ status: "offline", message: "Belum ada data dari sensor" });
    }

    const lastUpdate = new Date(lastData.created_at);
    const diffMinutes = (Date.now() - lastUpdate.getTime()) / (1000 * 60);

    const status = diffMinutes <= 5 ? "online" : "offline";
    const message = status === "online" ? "Sensor aktif" : "Sensor tidak aktif / tidak terhubung";

    res.json({ status, message, last_update: lastUpdate });
  } catch (err) {
    console.error("❌ getSensorStatus error:", err);
    res.status(500).json({ error: "internal error" });
  }
};
