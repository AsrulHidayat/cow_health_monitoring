import Cow from "../models/cowModel.js";
import Temperature from "../models/temperatureModel.js";
import { Op } from "sequelize";

// Ambil semua sapi milik user yang login (exclude soft deleted)
export const getCows = async (req, res) => {
  try {
    const user_id = req.user.id;
    const cows = await Cow.findAll({
      where: {
        user_id,
        is_deleted: false, // ✅ Hanya ambil yang belum dihapus
      },
      order: [["created_at", "DESC"]],
    });
    res.json(cows);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Ambil semua sapi (untuk dropdown) - PUBLIC endpoint untuk sensor IoT
export const getAllCowsPublic = async (req, res) => {
  try {
    const cows = await Cow.findAll({
      where: {
        is_deleted: false, // ✅ Hanya ambil yang belum dihapus
      },
      attributes: ["id", "tag", "umur"],
      order: [["created_at", "ASC"]],
    });
    res.json(cows);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Tambah sapi baru
export const addCow = async (req, res) => {
  try {
    console.log("📥 Data yang diterima:", req.body);
    console.log("👤 User dari token:", req.user);

    const { tag, umur } = req.body;
    const user_id = req.user.id; // dari middleware verifyToken

    // Validasi input
    if (!tag || !umur) {
      return res.status(400).json({
        message: "Tag dan umur sapi harus diisi",
        received: { tag, umur },
      });
    }

    // Buat sapi baru dengan field yang sesuai
    const newCow = await Cow.create({
      user_id,
      tag,
      umur,
    });

    console.log("✅ Sapi berhasil ditambahkan ke DB:", newCow.toJSON());
    res.status(201).json(newCow);
  } catch (error) {
    console.error("❌ Gagal menambahkan sapi:", error);
    res.status(500).json({
      message: "Gagal menambahkan sapi ke database",
      error: error.message,
      details: error.errors ? error.errors.map((e) => e.message) : undefined,
    });
  }
};

// Ambil sapi berdasarkan ID sapi
export const getCowById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const cow = await Cow.findOne({
      where: {
        id,
        user_id, // Pastikan user hanya bisa akses sapinya sendiri
      },
    });

    if (!cow) {
      return res.status(404).json({ message: "Sapi tidak ditemukan" });
    }

    res.json(cow);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Hapus sapi
export const deleteCow = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Cari sapi yang akan dihapus
    const cow = await Cow.findOne({
      where: {
        id,
        user_id,
        is_deleted: false, // Pastikan belum dihapus sebelumnya
      },
    });

    if (!cow) {
      return res
        .status(404)
        .json({ message: "Sapi tidak ditemukan atau sudah dihapus" });
    }

    // Update field soft delete
    await cow.update({
      is_deleted: true,
      deleted_at: new Date(),
    });

    console.log(`✅ Sapi ${cow.tag} berhasil di-soft delete`);

    res.json({
      message: "Sapi berhasil dihapus",
      id,
      tag: cow.tag,
      deleted_at: cow.deleted_at,
    });
  } catch (error) {
    console.error("❌ Gagal menghapus sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Ambil semua sapi yang sudah dihapus (soft deleted)
export const getDeletedCows = async (req, res) => {
  try {
    const user_id = req.user.id;
    const deletedCows = await Cow.findAll({
      where: {
        user_id,
        is_deleted: true,
      },
      order: [["deleted_at", "DESC"]],
    });
    res.json(deletedCows);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi yang dihapus:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Restore sapi yang sudah dihapus dengan tag baru
export const restoreCow = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Cari sapi yang akan di-restore
    const cow = await Cow.findOne({
      where: {
        id,
        user_id,
        is_deleted: true,
      },
    });

    if (!cow) {
      return res.status(404).json({
        message: "Sapi tidak ditemukan atau belum dihapus",
      });
    }

    // 🔢 Cari nomor ID yang kosong (gap filling)
    const allCows = await Cow.findAll({
      where: {
        user_id,
        is_deleted: false,
      },
      attributes: ["tag"],
    });

    const existingNumbers = allCows
      .map((c) => {
        const match = c.tag.match(/SAPI-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => a - b);

    // Cari nomor terkecil yang belum terpakai
    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else if (num > nextNumber) {
        break;
      }
    }

    const newTag = `SAPI-${String(nextNumber).padStart(3, "0")}`;

    // Update sapi dengan tag baru dan reset soft delete
    await cow.update({
      tag: newTag,
      is_deleted: false,
      deleted_at: null,
    });

    console.log(`✅ Sapi berhasil di-restore dengan tag baru: ${newTag}`);

    res.json({
      message: "Sapi berhasil di-restore",
      cow: {
        id: cow.id,
        tag: newTag,
        umur: cow.umur,
        oldTag: req.body.oldTag || "N/A",
      },
    });
  } catch (error) {
    console.error("❌ Gagal restore sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Hitung jumlah sapi
    const totalCows = await Cow.count({
      where: { user_id },
    });

    // Ambil data temperatur terbaru untuk setiap sapi
    const cows = await Cow.findAll({
      where: { user_id },
      attributes: ["id", "tag"],
    });

    let healthyCount = 0;
    let unhealthyCount = 0;
    let criticalCount = 0;

    for (const cow of cows) {
      const latestTemp = await Temperature.findOne({
        where: { cow_id: cow.id },
        order: [["created_at", "DESC"]],
        limit: 1,
      });

      if (latestTemp) {
        const temp = latestTemp.temperature;
        if (temp >= 37.5 && temp <= 39.5) {
          healthyCount++;
        } else if (temp > 39.5 && temp <= 40.5) {
          unhealthyCount++;
        } else if (temp > 40.5) {
          criticalCount++;
        }
      }
    }

    // Status pemeriksaan (dalam persentase)
    const totalChecked = healthyCount + unhealthyCount + criticalCount;
    const checkupStatus = {
      sudahDiperiksa:
        totalCows > 0 ? Math.round((totalChecked / totalCows) * 100) : 0,
      sedangDiperiksa: 22, // Contoh statis, bisa disesuaikan
      belumDiperiksa:
        totalCows > 0
          ? Math.round(((totalCows - totalChecked) / totalCows) * 100)
          : 0,
      sapiAman: 28, // Contoh statis
    };

    res.json({
      totalCows,
      healthyCount,
      unhealthyCount,
      criticalCount,
      checkupStatus,
      recentActivity: {
        sapiSehat: 74,
        perluDiperhatikan: 55,
        harusinDiperhatikan: 20,
        segeraTindaki: 5,
      },
    });
  } catch (error) {
    console.error("❌ Gagal mengambil dashboard stats:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Ambil notifikasi untuk dashboard
export const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Ambil sapi-sapi milik user
    const cows = await Cow.findAll({
      where: { user_id },
      attributes: ["id", "tag"],
    });

    const notifications = [];

    for (const cow of cows) {
      // Cek temperatur terakhir
      const latestTemp = await Temperature.findOne({
        where: { cow_id: cow.id },
        order: [["created_at", "DESC"]],
      });

      if (latestTemp) {
        const temp = latestTemp.temperature;

        // Buat notifikasi berdasarkan kondisi
        if (temp > 40.5) {
          notifications.push({
            id: `notif-${cow.id}-critical`,
            type: "critical",
            title: `Segara Tindaki - ${cow.tag}`,
            message: "Semua parameter bermasalah, segera periksa kondisi sapi",
            timestamp: latestTemp.created_at,
          });
        } else if (temp > 39.5) {
          notifications.push({
            id: `notif-${cow.id}-warning`,
            type: "warning",
            title: `Harus Diperhatikan - ${cow.tag}`,
            message: `Parameter gerakan dan detak jantung bermasalah, segera periksa kondisi sapi`,
            timestamp: latestTemp.created_at,
          });
        }
      }

      // Sort by timestamp descending
      notifications.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // Limit to 5 latest notifications
      res.json(notifications.slice(0, 5));
    }
  } catch (error) {
    console.error("❌ Gagal mengambil notifikasi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Update status pemeriksaan
export const updateCheckupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkupStatus } = req.body;
    const user_id = req.user.id;

    const cow = await Cow.findOne({ where: { id, user_id } });

    if (!cow) {
      return res.status(404).json({ message: "Sapi tidak ditemukan" });
    }

    cow.checkupStatus = checkupStatus;

    // Jika status diubah ke "Telah diperiksa", simpan tanggal pemeriksaan
    if (checkupStatus === "Telah diperiksa") {
      cow.checkupDate = new Date();
    } else {
      // Jika diubah ke "Belum diperiksa", hapus tanggal pemeriksaan
      cow.checkupDate = null;
    }

    await cow.save();

    res.json({
      message: "Status pemeriksaan berhasil diupdate",
      cow,
    });
  } catch (error) {
    console.error("Error updating checkup status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fungsi helper untuk mengecek dan mereset status pemeriksaan yang sudah kadaluarsa
export const checkAndResetExpiredCheckups = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Update semua sapi yang statusnya "Telah diperiksa" dan sudah lebih dari 1 minggu
    await Cow.update(
      {
        checkupStatus: "Belum diperiksa",
        checkupDate: null,
      },
      {
        where: {
          checkupStatus: "Telah diperiksa",
          checkupDate: {
            [Op.lte]: oneWeekAgo,
          },
        },
      }
    );

    next();
  } catch (error) {
    console.error("Error checking expired checkups:", error);
    next();
  }
};
