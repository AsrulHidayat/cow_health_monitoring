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
        type: DataTypes.JSON, // Gunakan JSON jika database Anda (misal: PostgreSQL) mendukung
        // atau DataTypes.STRING jika Anda ingin menyimpan sebagai string "suhu,gerakan"
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
    // timestamp (created_at dan updated_at) akan ditambahkan otomatis oleh Sequelize
}, {
    tableName: 'notifications',
    timestamps: true 
});

// Definisikan relasi
Cow.hasMany(Notification, { foreignKey: 'sapiId' });
Notification.belongsTo(Cow, { foreignKey: 'sapiId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export default Notification;