import Movement from "../models/movementModel.js";
import { Op } from "sequelize";

// ✅ Tambah data gerakan baru (dari sensor_gerakan.ino)
export const addMovement = async (req, res) => {
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

    const newMovement = await Movement.create({
      cow_id,
      accel_x,
      accel_y,
      accel_z,
      created_at: new Date(),
    });

    console.log("✅ Insert gerakan berhasil:", newMovement.toJSON());
    res.status(201).json({ ok: true, insertedId: newMovement.id });
  } catch (err) {
    console.error("❌ Error addMovement:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil data gerakan terbaru
export const getLatestMovement = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    const latest = await Movement.findOne({
      where: { cow_id: cowId },
      order: [["created_at", "DESC"]],
    });

    res.json(latest || null);
  } catch (err) {
    console.error("❌ getLatestMovement error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Ambil riwayat gerakan dengan pagination dan filter tanggal
export const getHistoryMovement = async (req, res) => {
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
    const totalCount = await Movement.count({ where: whereClause });

    // Get paginated data
    const history = await Movement.findAll({
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
    console.error("❌ getHistoryMovement error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Cek status sensor gerakan
export const getSensorStatus = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    console.log("Cek status sensor gerakan untuk cowId:", cowId);

    const lastData = await Movement.findOne({
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
    // Kita beri toleransi 1 menit (60 detik)
    const diffSeconds = (Date.now() - lastUpdate.getTime()) / 1000;

    const status = diffSeconds <= 60 ? "online" : "offline";
    const message =
      status === "online"
        ? "Sensor aktif"
        : "Sensor tidak aktif / tidak terhubung";

    res.json({ status, message, last_update: lastUpdate });
  } catch (err)
 {
    console.error("❌ getSensorStatus (gerakan) error:", err);
    res.status(500).json({ error: "internal error" });
  }
};

// ✅ Hapus semua data gerakan untuk sapi tertentu
export const deleteAllMovement = async (req, res) => {
  try {
    const cowId = Number(req.params.cowId);
    
    const deleted = await Movement.destroy({
      where: { cow_id: cowId }
    });
    
    res.json({ 
      message: `Berhasil menghapus ${deleted} data gerakan`,
      deletedCount: deleted 
    });
  } catch (err) {
    console.error("Error deleting movement data:", err);
    res.status(500).json({ error: "Internal error" });
  }
};