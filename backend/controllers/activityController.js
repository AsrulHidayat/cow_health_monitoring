import activity from "../models/activityModel.js";
import { Op } from "sequelize";

// ✅ Tambah data gerakan baru (dari sensor_gerakan.ino)
export const addactivity = async (req, res) => {
  try {
    console.log("📩 Data gerakan masuk:", req.body);
    const { cow_id, accel_x, accel_y, accel_z } = req.body;

    if (
      !cow_id ||
      typeof accel_x !== "number" ||
      typeof accel_y !== "number" ||
      typeof accel_z !== "number"
    ) {
      return res
        .status(400)
        .json({ error: "cow_id dan data akselerometer (x, y, z) wajib diisi" });
    }

    const newactivity = await activity.create({
      cow_id,
      accel_x,
      accel_y,
      accel_z,
      created_at: new Date(),
    });

    console.log("✅ Insert gerakan berhasil:", newactivity.toJSON());
    res.status(201).json({ ok: true, insertedId: newactivity.id });
  } catch (err) {
    console.error("❌ Error addactivity:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil data gerakan terbaru
export const getLatestactivity = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const latest = await activity.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    if (!latest) {
      return res.json(null);
    }

    // Hitung magnitude dari accelerometer
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
    console.error("❌ getLatestactivity error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil riwayat gerakan dengan pagination dan filter tanggal
export const getHistoryactivity = async (req, res) => {
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
    const totalCount = await activity.count({ where: whereClause });

    // Get paginated data
    const history = await activity.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    // Transform data: hitung magnitude untuk setiap record
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
    console.error("❌ getHistoryactivity error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Cek status sensor gerakan
export const getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    console.log("Cek status sensor gerakan untuk cowId:", cowId);

    const lastData = await activity.findOne({
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
    // Sensor gerakan mengirim data tiap 5 detik (delay 5000 di .ino)
    // Kita beri toleransi 30 detik untuk lebih aman
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

// ✅ Get activity statistics
export const getactivityStats = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const { startDate, endDate } = req.query;

    const whereClause = { cow_id: cowId };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const activitys = await activity.findAll({
      where: whereClause,
      order: [["created_at", "ASC"]],
    });

    if (activitys.length === 0) {
      return res.json({
        count: 0,
        min: null,
        max: null,
        average: null,
        firstRecord: null,
        lastRecord: null,
      });
    }

    // Hitung magnitude untuk setiap data
    const magnitudes = activitys.map((m) =>
      Math.sqrt(
        Math.pow(m.accel_x, 2) + Math.pow(m.accel_y, 2) + Math.pow(m.accel_z, 2)
      )
    );

    const min = Math.min(...magnitudes);
    const max = Math.max(...magnitudes);
    const avg =
      magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;

    res.json({
      count: activitys.length,
      min: parseFloat(min.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      average: parseFloat(avg.toFixed(1)),
      firstRecord: activitys[0].created_at,
      lastRecord: activitys[activitys.length - 1].created_at,
    });
  } catch (err) {
    console.error("❌ getactivityStats error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Hapus semua data gerakan untuk sapi tertentu
export const deleteAllactivity = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);

    const deleted = await activity.destroy({
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
