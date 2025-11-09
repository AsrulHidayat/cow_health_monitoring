import Temperature from "../models/temperatureModel.js";
import Cow from "../models/cowModel.js";
import Notification from "../models/notificationModel.js";
import { Op } from "sequelize"; // <-- DIPINDAHKAN KE ATAS

// ========================================
// 🔔 HELPER NOTIFIKASI
// ========================================
const categorizeTemperature = (temp) => {
  if (temp == null) return { status: 'unknown', severity: 0 };
  if (temp < 37.5) return { status: 'hipotermia', severity: 2 }; // Warning
  if (temp >= 37.5 && temp <= 39.5) return { status: 'normal', severity: 0 };
  if (temp > 39.5 && temp <= 40.5) return { status: 'demam-ringan', severity: 1 }; // Info/Warning
  if (temp > 40.5 && temp <= 41.5) return { status: 'demam-tinggi', severity: 2 }; // Warning
  return { status: 'kritis', severity: 3 }; // Urgent
};

const generateMessage = (tempData, status, params) => {
  const t = tempData.temperature.toFixed(1);
  if (status.severity === 3) { // Kritis
    return `Suhu kritis ${t}°C terdeteksi. Risiko heat stroke tinggi!`;
  }
  if (status.status === 'demam-tinggi') {
    return `Demam tinggi ${t}°C terdeteksi. Kemungkinan infeksi serius.`;
  }
  if (status.status === 'hipotermia') {
    return `Hipotermia ${t}°C terdeteksi. Sapi kedinginan.`;
  }
  if (status.status === 'demam-ringan') {
    return `Suhu tubuh ${t}°C, terdeteksi demam ringan.`;
  }
  return `Parameter ${params.join(', ')} di luar batas normal.`;
};

// Fungsi untuk membuat notifikasi (JANGAN di-await, biarkan berjalan di background)
const createNotificationOnAbnormalTemp = async (tempData) => {
  try {
    const tempCategory = categorizeTemperature(tempData.temperature);
    
    // Hanya buat notifikasi jika abnormal (severity > 0)
    if (tempCategory.severity > 0) {
      const cow = await Cow.findByPk(tempData.cow_id);
      if (!cow) return; // Sapi tidak ditemukan

      // Tentukan tipe notifikasi
      let type, severity;
      if (tempCategory.severity >= 3) {
        type = 'urgent';
        severity = 'Segera Tindaki';
      } else if (tempCategory.severity === 2) {
        type = 'warning';
        severity = 'Harus Diperhatikan';
      } else {
        type = 'info';
        severity = 'Perlu Diperhatikan';
      }

      const parameters = ['suhu'];
      const message = generateMessage(tempData, tempCategory, parameters);

      // Simpan notifikasi ke database
      await Notification.create({
        sapiId: cow.id,
        userId: cow.user_id,
        sapiName: cow.tag,
        type: type,
        parameters: parameters,
        severity: severity,
        message: message,
        isRead: false
      });
      console.log(`🔔 Notifikasi SUHU dibuat untuk Sapi ${cow.tag}`);
    }
  } catch (error) {
    console.error("Gagal membuat notifikasi suhu:", error);
  }
};

// 🔹 Tambah data suhu baru
export const addTemperature = async (req, res) => {
  try {
    console.log("📩 Data masuk:", req.body);
    const { cow_id, temperature } = req.body;

    if (!cow_id || typeof temperature !== "number") {
      return res
        .status(400)
        .json({ error: "cow_id dan temperature wajib diisi" });
    }

    const newTemp = await Temperature.create({
      cow_id,
      temperature,
      created_at: new Date(),
    });

    createNotificationOnAbnormalTemp(newTemp);
    console.log("✅ Insert berhasil:", newTemp.toJSON());
    res.status(201).json({ ok: true, insertedId: newTemp.id });
  } catch (err) {
    console.error("❌ Error addTemperature:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Ambil data suhu terbaru
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

// 🔹 Ambil riwayat suhu dengan pagination dan filter tanggal
export const getHistoryTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Math.min(10000, Number(req.query.limit) || 500);
    const offset = Number(req.query.offset) || 0;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build where clause
    const whereClause = { cow_id: cowId };

    // Jika ada filter tanggal
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.created_at = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.created_at = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Get total count
    const totalCount = await Temperature.count({ where: whereClause });

    // Get paginated data
    const history = await Temperature.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.json({
      data: history,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("❌ getHistoryTemperature error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Ambil semua data dalam range tanggal (untuk ekspor/analisis)
export const getTemperatureByDateRange = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate dan endDate harus diisi",
      });
    }

    const history = await Temperature.findAll({
      where: {
        cow_id: cowId,
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      order: [["created_at", "ASC"]],
    });

    res.json({
      data: history,
      count: history.length,
      startDate,
      endDate,
    });
  } catch (err) {
    console.error("❌ getTemperatureByDateRange error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Hitung rata-rata suhu
export const getAverageTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Number(req.query.limit) || 60;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const whereClause = { cow_id: cowId };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const temps = await Temperature.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: startDate && endDate ? undefined : limit,
    });

    if (temps.length === 0) return res.json({ average: null });

    const avg = temps.reduce((sum, t) => sum + t.temperature, 0) / temps.length;

    res.json({
      cow_id: cowId,
      average: avg,
      count: temps.length,
    });
  } catch (err) {
    console.error("❌ getAverageTemperature error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Cek status sensor
export const getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    console.log("Cek status sensor untuk cowId:", cowId);

    const lastData = await Temperature.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    if (!lastData) {
      return res.json({
        status: "offline",
        message: "Belum ada data dari sensor",
      });
    }

    const lastUpdate = new Date(lastData.created_at);
    const diffMinutes = (Date.now() - lastUpdate.getTime()) / (1000 * 60);

    const status = diffMinutes <= 5 ? "online" : "offline";
    const message =
      status === "online"
        ? "Sensor aktif"
        : "Sensor tidak aktif / tidak terhubung";

    res.json({ status, message, last_update: lastUpdate });
  } catch (err) {
    console.error("❌ getSensorStatus error:", err);
    res.status(500).json({ error: "internal error" });
}
};

// 🔹 Ambil statistik data (untuk info)
export const getTemperatureStats = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const { startDate, endDate } = req.query;

    const whereClause = { cow_id: cowId };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const temps = await Temperature.findAll({
      where: whereClause,
      order: [["created_at", "ASC"]],
    });

    if (temps.length === 0) {
      return res.json({
        count: 0,
        min: null,
        max: null,
        average: null,
        firstRecord: null,
        lastRecord: null,
      });
    }

    const temperatures = temps.map((t) => t.temperature);
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const avg =
      temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;

    res.json({
      count: temps.length,
      min,
      max,
      average: avg,
      firstRecord: temps[0].created_at,
      lastRecord: temps[temps.length - 1].created_at,
    });
  } catch (err) {
    console.error("❌ getTemperatureStats error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// Hapus semua data suhu untuk sapi tertentu
export const deleteAllTemperature = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    
    const deleted = await Temperature.destroy({
      where: { cow_id: cowId }
    });
    
    res.json({ 
      message: `Berhasil menghapus ${deleted} data suhu`,
      deletedCount: deleted 
    });
  } catch (err) {
    console.error("Error deleting temperature data:", err);
    res.status(500).json({ error: "Internal error" });
  }
};
