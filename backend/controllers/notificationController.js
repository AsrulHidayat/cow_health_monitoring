import Temperature from "../models/temperatureModel.js";
import Activity from "../models/activityModel.js";
import Cow from "../models/cowModel.js";
import { Op } from "sequelize";

// ========================================
// 🔔 FUNGSI HELPER: KLASIFIKASI SUHU
// ========================================
const categorizeTemperature = (temp) => {
  if (temp == null) return { status: 'unknown', severity: 0 };
  if (temp < 37.5) return { status: 'hipotermia', severity: 2 };
  if (temp >= 37.5 && temp <= 39.5) return { status: 'normal', severity: 0 };
  if (temp > 39.5 && temp <= 40.5) return { status: 'demam-ringan', severity: 1 };
  if (temp > 40.5 && temp <= 41.5) return { status: 'demam-tinggi', severity: 2 };
  return { status: 'kritis', severity: 3 };
};

// ========================================
// 🔔 FUNGSI HELPER: KLASIFIKASI AKTIVITAS
// ========================================
const categorizeActivity = (x, y, z) => {
  if ([x, y, z].some(v => v == null || isNaN(v))) {
    return { status: 'unknown', severity: 2 };
  }

  x = parseFloat(Number(x).toFixed(2));
  y = parseFloat(Number(y).toFixed(2));
  z = parseFloat(Number(z).toFixed(2));

  // Berdiri (Normal)
  if (x >= -1.2 && x <= 0.1 && y >= -3.0 && y <= 0.0 && z >= 10.5 && z <= 12.0) {
    return { status: 'berdiri', severity: 0 };
  }

  // Berbaring (Normal)
  if ((x >= -0.6 && x <= 0.2 && y >= 4.0 && y <= 7.2 && z >= 7.3 && z <= 11.2) ||
      (x >= 0.0 && x <= 0.4 && y >= 9.8 && y <= 10.8 && z >= 2.8 && z <= 4.3) ||
      (x >= -0.6 && x <= 0.2 && y >= -10.2 && y <= -6.3 && z >= 5.3 && z <= 8.7) ||
      (x >= 0.2 && x <= 0.8 && y >= -10.8 && y <= -9.6 && z >= -0.1 && z <= 2.7)) {
    return { status: 'berbaring', severity: 0 };
  }

  // Posisi tidak normal
  return { status: 'abnormal', severity: 2 };
};

// ========================================
// 🔔 FUNGSI UTAMA: GENERATE NOTIFIKASI
// ========================================
const generateNotifications = async (cowId) => {
  const notifications = [];
  
  try {
    // Ambil data terbaru (5 menit terakhir)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Cek suhu terbaru
    const latestTemp = await Temperature.findOne({
      where: { 
        cow_id: cowId,
        created_at: { [Op.gte]: fiveMinutesAgo }
      },
      order: [['created_at', 'DESC']]
    });

    // Cek aktivitas terbaru
    const latestActivity = await Activity.findOne({
      where: { 
        cow_id: cowId,
        created_at: { [Op.gte]: fiveMinutesAgo }
      },
      order: [['created_at', 'DESC']]
    });

    // Ambil data sapi
    const cow = await Cow.findByPk(cowId);
    if (!cow) return [];

    const abnormalParams = [];
    let maxSeverity = 0;

    // Evaluasi suhu
    if (latestTemp) {
      const tempCategory = categorizeTemperature(latestTemp.temperature);
      if (tempCategory.severity > 0) {
        abnormalParams.push('suhu');
        maxSeverity = Math.max(maxSeverity, tempCategory.severity);
      }
    }

    // Evaluasi aktivitas
    if (latestActivity) {
      const activityCategory = categorizeActivity(
        latestActivity.accel_x,
        latestActivity.accel_y,
        latestActivity.accel_z
      );
      if (activityCategory.severity > 0) {
        abnormalParams.push('gerakan');
        maxSeverity = Math.max(maxSeverity, activityCategory.severity);
      }
    }

    // Generate notifikasi jika ada parameter abnormal
    if (abnormalParams.length > 0) {
      let type, severity, message;

      if (maxSeverity >= 3) {
        type = 'urgent';
        severity = 'Segera Tindaki';
        message = generateUrgentMessage(latestTemp, latestActivity, abnormalParams);
      } else if (maxSeverity === 2) {
        type = 'warning';
        severity = 'Harus Diperhatikan';
        message = generateWarningMessage(latestTemp, latestActivity, abnormalParams);
      } else {
        type = 'info';
        severity = 'Perlu Diperhatikan';
        message = generateInfoMessage(latestTemp, latestActivity, abnormalParams);
      }

      notifications.push({
        id: `notif-${cowId}-${Date.now()}`,
        sapiId: cowId,
        sapiName: cow.tag,
        type,
        parameters: abnormalParams,
        severity,
        message,
        timestamp: new Date(),
        isRead: false
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error generating notifications:', error);
    return [];
  }
};

// ========================================
// 🔔 HELPER: GENERATE PESAN NOTIFIKASI
// ========================================
const generateUrgentMessage = (temp, activity, params) => {
  const messages = [];
  
  if (temp && params.includes('suhu')) {
    const t = temp.temperature;
    if (t > 41.5) {
      messages.push(`Suhu kritis ${t.toFixed(1)}°C - risiko heat stroke tinggi`);
    } else if (t < 37.5) {
      messages.push(`Hipotermia terdeteksi ${t.toFixed(1)}°C - segera periksa`);
    } else if (t > 40.5) {
      messages.push(`Demam tinggi ${t.toFixed(1)}°C - kemungkinan infeksi serius`);
    }
  }

  if (activity && params.includes('gerakan')) {
    messages.push('Posisi tubuh abnormal terdeteksi - sapi mungkin terjatuh atau kesulitan berdiri');
  }

  return messages.join('. ') || 'Kondisi sapi memerlukan perhatian segera';
};

const generateWarningMessage = (temp, activity, params) => {
  const messages = [];
  
  if (temp && params.includes('suhu')) {
    const t = temp.temperature;
    if (t > 40.5) {
      messages.push(`Suhu meningkat menjadi ${t.toFixed(1)}°C`);
    } else if (t < 37.5) {
      messages.push(`Suhu menurun menjadi ${t.toFixed(1)}°C`);
    }
  }

  if (activity && params.includes('gerakan')) {
    messages.push('Pola gerakan tidak normal terdeteksi');
  }

  return messages.join(', ') || 'Parameter kesehatan memerlukan pengawasan';
};

const generateInfoMessage = (temp, activity, params) => {
  const messages = [];
  
  if (temp && params.includes('suhu')) {
    const t = temp.temperature;
    messages.push(`Suhu sedikit di luar batas normal (${t.toFixed(1)}°C)`);
  }

  if (activity && params.includes('gerakan')) {
    messages.push('Aktivitas perlu dipantau lebih lanjut');
  }

  return messages.join(', ') || 'Perubahan kecil terdeteksi pada parameter kesehatan';
};

// ========================================
// 🔔 ENDPOINT: GET NOTIFIKASI PER SAPI
// ========================================
export const getNotificationsByCow = async (req, res) => {
  try {
    const { cowId } = req.query;

    if (!cowId) {
      return res.status(400).json({ message: 'cowId is required' });
    }

    const notifications = await generateNotifications(Number(cowId));
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================================
// 🔔 ENDPOINT: GET SEMUA NOTIFIKASI USER
// ========================================
export const getAllUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Ambil semua sapi milik user
    const cows = await Cow.findAll({
      where: { 
        user_id,
        is_deleted: false 
      }
    });

    // Generate notifikasi untuk semua sapi
    const allNotifications = [];
    
    for (const cow of cows) {
      const cowNotifications = await generateNotifications(cow.id);
      allNotifications.push(...cowNotifications);
    }

    // Sort berdasarkan timestamp (terbaru dulu)
    allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit ke 10 notifikasi terbaru
    const limitedNotifications = allNotifications.slice(0, 10);

    res.json(limitedNotifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================================
// 🔔 ENDPOINT: GET UNREAD COUNT
// ========================================
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cows = await Cow.findAll({
      where: { 
        user_id,
        is_deleted: false 
      }
    });

    let totalUnread = 0;
    
    for (const cow of cows) {
      const notifications = await generateNotifications(cow.id);
      totalUnread += notifications.filter(n => !n.isRead).length;
    }

    res.json({ count: totalUnread });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};