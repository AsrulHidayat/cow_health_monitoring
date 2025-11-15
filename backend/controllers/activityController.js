import Activity from "../models/activityModel.js";
import { Op } from "sequelize";
import Cow from "../models/cowModel.js";
import Notification from "../models/notificationModel.js";

// ========================================
// 🔔 HELPER NOTIFIKASI
// ========================================
const categorizeActivity = (x, y, z) => {
  if ([x, y, z].some((v) => v == null || isNaN(v))) {
    return { status: "unknown", severity: 2 };
  }

  x = parseFloat(Number(x).toFixed(2));
  y = parseFloat(Number(y).toFixed(2));
  z = parseFloat(Number(z).toFixed(2));

  // Kumpulan data 'berbaring'
  const isLying =
    (x >= -0.6 && x <= 0.2 && y >= 4.0 && y <= 7.2 && z >= 7.3 && z <= 11.2) ||
    (x >= 0.0 && x <= 0.4 && y >= 9.8 && y <= 10.8 && z >= 2.8 && z <= 4.3) ||
    (x >= -0.6 && x <= 0.2 && y >= -10.2 && y <= -6.3 && z >= 5.3 && z <= 8.7) ||
    (x >= 0.2 && x <= 0.8 && y >= -10.8 && y <= -9.6 && z >= -0.1 && z <= 2.7);

  // Kumpulan data 'berdiri'
  const isStanding =
    x >= -1.2 && x <= 0.1 && y >= -3.0 && y <= 0.0 && z >= 10.5 && z <= 12.0; // Berdiri (Normal)

  if (isStanding) {
    return { status: "berdiri", severity: 0 };
  } // Berbaring (Normal)
  if (isLying) {
    return { status: "berbaring", severity: 0 };
  } // Posisi tidak normal (Warning)
  return { status: "abnormal", severity: 2 };
};

const generateMessage = (activity, status, params) => {
  if (status.status === "abnormal") {
    return `Posisi tubuh sapi abnormal terdeteksi. Sapi mungkin terjatuh atau kesulitan berdiri.`;
  }
  if (status.status === "unknown") {
    return `Data sensor gerakan tidak valid (N/A). Perlu pengecekan sensor.`;
  }
  return `Parameter ${params.join(", ")} di luar batas normal.`;
};

// ========================================
// 🔔 FUNGSI PEMBUAT NOTIFIKASI (BARU)
// ========================================
/**
 * Menganalisis data aktivitas baru dan membuat notifikasi jika abnormal.
 * Dijalankan di background (tanpa 'await') agar tidak memblokir respon API.
 * @param {object} activityData - Data aktivitas yang baru saja disimpan
 */
const createNotificationOnAbnormalActivity = async (activityData) => {
  try {
    const activityCategory = categorizeActivity(
      activityData.accel_x,
      activityData.accel_y,
      activityData.accel_z
    ); // 1. Hanya buat notifikasi jika abnormal (severity > 0)

    if (activityCategory.severity > 0) {
      const cow = await Cow.findByPk(activityData.cow_id);
      if (!cow) return; // Sapi tidak ditemukan, hentikan // 2. Tentukan tipe notifikasi

      let type, severity;
      if (activityCategory.severity >= 3) {
        type = "urgent";
        severity = "Segera Tindaki";
      } else {
        type = "warning";
        severity = "Harus Diperhatikan";
      }

      // --- PERBAIKAN: Tambahkan Pengecekan De-bouncing (Anti-Spam) ---
      const existingUnreadNotif = await Notification.findOne({
        where: {
          sapiId: cow.id,
          isRead: false,
          type: type, // Cek berdasarkan tipe (urgent/warning)
        },
      });

      // Jika SUDAH ADA notifikasi yang belum dibaca, JANGAN BUAT LAGI.
      if (existingUnreadNotif) {
        console.log(
          `(Notifikasi GERAKAN untuk Sapi ${cow.tag} ditahan, notif ${existingUnreadNotif.id} belum dibaca)`
        );
        return; // Hentikan
      }
      // --- BATAS PERBAIKAN ---

      const parameters = ["gerakan"];
      const message = generateMessage(
        activityData,
        activityCategory,
        parameters
      ); // 3. Simpan notifikasi ke database

      await Notification.create({
        sapiId: cow.id,
        userId: cow.user_id, // Ambil dari data Sapi
        sapiName: cow.tag, // Ambil dari data Sapi
        type: type,
        parameters: parameters,
        severity: severity,
        message: message,
        isRead: false,
      });
      console.log(`🔔 Notifikasi GERAKAN dibuat untuk Sapi ${cow.tag}`);
    }
  } catch (error) {
    // Tangkap error agar tidak crash
    console.error("Gagal membuat notifikasi gerakan:", error);
  }
};

// 🔹 Tambah data gerakan baru (dari sensor_gerakan.ino)
export const createActivity = async (req, res) => {
  try {
    console.log("📩 Data gerakan masuk:", req.body);
    const { cow_id, accel_x, accel_y, accel_z } = req.body;

    if (
      !cow_id ||
      accel_x === undefined ||
      accel_y === undefined ||
      accel_z === undefined
    ) {
      return res
        .status(400)
        .json({ error: "cow_id dan data akselerometer (x, y, z) wajib diisi" });
    }

    const newActivity = await Activity.create({
      cow_id,
      accel_x,
      accel_y,
      accel_z,
    }); // Panggil fungsi notifikasi setelah data disimpan (tanpa 'await')

    createNotificationOnAbnormalActivity(newActivity);

    console.log("✅ Insert gerakan berhasil:", newActivity.toJSON());
    res.status(201).json(newActivity);
  } catch (err) {
    console.error("❌ Error createActivity:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Ambil data gerakan terbaru
export const getLatestActivity = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const latest = await Activity.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    if (!latest) {
      return res.json(null);
    }

    const magnitude = Math.sqrt(
      Math.pow(latest.accel_x, 2) +
        Math.pow(latest.accel_y, 2) +
        Math.pow(latest.accel_z, 2)
    );
    res.json({
      id: latest.id,
      cow_id: latest.cow_id,
      x: latest.accel_x,
      y: latest.accel_y,
      z: latest.accel_z,
      magnitude: magnitude,
      timestamp: latest.created_at,
    });
  } catch (err) {
    console.error("❌ getLatestActivity error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Ambil riwayat gerakan dengan pagination dan filter tanggal
export const getHistoryActivity = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const limit = Math.min(10000, Number(req.query.limit) || 500);
    const offset = Number(req.query.offset) || 0;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const whereClause = { cow_id: cowId };

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

    const totalCount = await Activity.count({ where: whereClause });

    const history = await Activity.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const transformedData = history.map((item) => {
      const magnitude = Math.sqrt(
        Math.pow(item.accel_x, 2) +
          Math.pow(item.accel_y, 2) +
          Math.pow(item.accel_z, 2)
      );

      return {
        id: item.id,
        cow_id: item.cow_id,
        x: item.accel_x,
        y: item.accel_y,
        z: item.accel_z,
        magnitude: magnitude,
        timestamp: item.created_at,
      };
    });

    res.json({
      data: transformedData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("❌ getHistoryActivity error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Cek status sensor gerakan
export const getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    console.log("Cek status sensor gerakan untuk cowId:", cowId);

    const lastData = await Activity.findOne({
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
    const diffSeconds = (Date.now() - lastUpdate.getTime()) / 1000;
    const status = diffSeconds <= 30 ? "online" : "offline";
    const message =
      status === "online"
        ? "Sensor aktif"
        : "Sensor tidak aktif / tidak terhubung";

    res.json({
      status,
      message,
      last_update: lastUpdate,
      seconds_ago: Math.floor(diffSeconds),
    });
  } catch (err) {
    console.error("❌ getSensorStatus (gerakan) error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const { startDate, endDate } = req.query;

    const whereClause = { cow_id: cowId };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const activities = await Activity.findAll({
      where: whereClause,
      order: [["created_at", "ASC"]],
    });

    if (activities.length === 0) {
      return res.json({
        count: 0,
        min: null,
        max: null,
        average: null,
        firstRecord: null,
        lastRecord: null,
      });
    }

    const magnitudes = activities.map((m) =>
      Math.sqrt(
        Math.pow(m.accel_x, 2) + Math.pow(m.accel_y, 2) + Math.pow(m.accel_z, 2)
      )
    );

    const min = Math.min(...magnitudes);
    const max = Math.max(...magnitudes);
    const avg =
      magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;

    res.json({
      count: activities.length,
      min: parseFloat(min.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      average: parseFloat(avg.toFixed(1)),
      firstRecord: activities[0].created_at,
      lastRecord: activities[activities.length - 1].created_at,
    });
  } catch (err) {
    console.error("❌ getActivityStats error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// 🔹 Hapus semua data gerakan untuk sapi tertentu
export const deleteAllActivity = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);

    const deleted = await Activity.destroy({
      where: { cow_id: cowId },
    });

    res.json({
      message: `Berhasil menghapus ${deleted} data gerakan`,
      deletedCount: deleted,
    });
  } catch (err) {
    console.error("Error deleting activity data:", err);
    res.status(500).json({ error: "Internal error" });
  }
};
