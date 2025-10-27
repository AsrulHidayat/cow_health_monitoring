import Cow from "../models/cowModel.js";
import Temperature from "../models/temperatureModel.js";

// Ambil semua sapi milik user yang login
export const getCows = async (req, res) => {
  try {
    const user_id = req.user.id; // dari middleware verifyToken
    const cows = await Cow.findAll({ 
      where: { user_id },
      order: [['created_at', 'DESC']]
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
      attributes: ['id', 'tag', 'umur'],
      order: [['created_at', 'ASC']] // Urutkan berdasarkan yang pertama dibuat
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
        received: { tag, umur }
      });
    }
    
    // Buat sapi baru dengan field yang sesuai
    const newCow = await Cow.create({ 
      user_id, 
      tag, 
      umur
    });
    
    console.log("✅ Sapi berhasil ditambahkan ke DB:", newCow.toJSON());
    res.status(201).json(newCow);
    
  } catch (error) {
    console.error("❌ Gagal menambahkan sapi:", error);
    res.status(500).json({ 
      message: "Gagal menambahkan sapi ke database", 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : undefined
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
        user_id // Pastikan user hanya bisa akses sapinya sendiri
      } 
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
    
    const deleted = await Cow.destroy({
      where: { 
        id, 
        user_id // Pastikan user hanya bisa hapus sapinya sendiri
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: "Sapi tidak ditemukan" });
    }
    
    res.json({ message: "Sapi berhasil dihapus", id });
  } catch (error) {
    console.error("❌ Gagal menghapus sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Hitung jumlah sapi
    const totalCows = await Cow.count({
      where: { user_id }
    });
    
    // Ambil data temperatur terbaru untuk setiap sapi
    const cows = await Cow.findAll({
      where: { user_id },
      attributes: ['id', 'tag'],
    });
    
    let healthyCount = 0;
    let unhealthyCount = 0;
    let criticalCount = 0;
    
    for (const cow of cows) {
      const latestTemp = await Temperature.findOne({
        where: { cow_id: cow.id },
        order: [['created_at', 'DESC']],
        limit: 1
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
      telahDiperiksa: totalCows > 0 ? Math.round((totalChecked / totalCows) * 100) : 0,
      sedangDiperiksa: 22, // Contoh statis, bisa disesuaikan
      belumDiperiksa: totalCows > 0 ? Math.round(((totalCows - totalChecked) / totalCows) * 100) : 0,
      sapiAman: 28 // Contoh statis
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
        segeraTindaki: 5
      }
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
      attributes: ['id', 'tag']
    });
    
    const notifications = [];
    
    for (const cow of cows) {
      // Cek temperatur terakhir
      const latestTemp = await Temperature.findOne({
        where: { cow_id: cow.id },
        order: [['created_at', 'DESC']]
      });
      
      if (latestTemp) {
        const temp = latestTemp.temperature;
        
        // Buat notifikasi berdasarkan kondisi
        if (temp > 40.5) {
          notifications.push({
            id: `notif-${cow.id}-critical`,
            type: 'critical',
            title: `Segara Tindaki - ${cow.tag}`,
            message: 'Semua parameter bermasalah, segera periksa kondisi sapi',
            timestamp: latestTemp.created_at
          });
        } else if (temp > 39.5) {
          notifications.push({
            id: `notif-${cow.id}-warning`,
            type: 'warning', 
            title: `Harus Diperhatikan - ${cow.tag}`,
            message: `Parameter gerakan dan detak jantung bermasalah, segera periksa kondisi sapi`,
            timestamp: latestTemp.created_at
          });
      }
    }
    
    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit to 5 latest notifications
    res.json(notifications.slice(0, 5));
    
  }} catch (error) {
    console.error("❌ Gagal mengambil notifikasi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};