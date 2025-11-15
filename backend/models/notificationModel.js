// models/notificationModel.js
import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Cow from "./cowModel.js";
import User from "./userModel.js";

const Notification = db.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sapiId: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cow,
            key: 'id'
        }
    },
    userId: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    sapiName: { // Denormalisasi untuk kemudahan query
        type: DataTypes.STRING,
        allowNull: false
    },
    type: { // 'urgent', 'warning', 'info'
        type: DataTypes.STRING,
        allowNull: false
    },
    parameters: { // ['suhu', 'gerakan']
        type: DataTypes.JSON, 
        allowNull: true
    },
    severity: { // 'Segera Tindaki', 'Harus Diperhatikan'
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
    // timestamp (created_at dan updated_at) akan ditambahkan otomatis
}, {
    tableName: 'notifications',
    timestamps: true,

    // --- PERBAIKAN: TAMBAHKAN BLOK INI ---
    // Menambahkan indeks untuk mempercepat query database secara drastis
    indexes: [
        // Indeks komposit untuk mempercepat pencarian "belum dibaca" per user
        // Digunakan oleh getUnreadCount dan getAllUserNotifications
        {
            name: 'idx_notifications_user_read',
            fields: ['userId', 'isRead']
        },
        // Indeks untuk mempercepat join ke tabel Sapi
        {
            name: 'idx_notifications_sapiId',
            fields: ['sapiId']
        }
    ]
    // --- BATAS BLOK TAMBAHAN ---
});

// Definisikan relasi
Cow.hasMany(Notification, { foreignKey: 'sapiId' });
Notification.belongsTo(Cow, { foreignKey: 'sapiId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export default Notification;