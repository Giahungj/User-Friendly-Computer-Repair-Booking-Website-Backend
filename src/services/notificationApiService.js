import { where } from "sequelize/lib/sequelize";
import db from "../models/index"
import { Op } from "sequelize";
import { getIO } from '../server';

// --------------------------------------------------
const getUserNotificationsByUserId = async (userId) => {
    try {
        // Lấy ngày hiện tại (bắt đầu từ 00:00:00)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const notifications = await db.Notification.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            raw: true
        });

        if (!notifications.length) {
            return { EC: 1, EM: "Không có thông báo nào!", DT: [] };
        }
        return { EC: 0, EM: "", DT: notifications };
    } catch (error) {
        console.error("Lỗi trong getUserNotificationsByUserId:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};

// --------------------------------------------------
const markAsReadNotificationsByNotificationId = async (notificationId) => {
    try {
        await db.Notification.update(
            { isRead: 1 },
            { where: { id: notificationId } }
        );
    } catch (error) {
        console.error("Lỗi trong markAsReadNotificationsByNotificationId:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};

// --------------------------------------------------
const createNotification = async (userId, message, action = null) => {
    try {
        console.log("====================================================");
        console.log("notificationData: ", userId, message, action);
        // Kiểm tra userId có hợp lệ không
        const user = await db.User.findOne({ where: { id: userId } });
        if (!user) {
            return { EC: 1, EM: "Người dùng không tồn tại!", DT: null };
        }

        // Tạo thông báo mới
        const notification = await db.Notification.create({
            userId,
            message,
            action,
            isRead: false
        });

        // const io = getIO();
        // console.log(`===================================================================`);   // <‑‑ log
        // console.log("Bắt đầu chạy io ===============================================================================================================================================================================================================================================================================================================================================");
        // if (io) {
        //     console.log(`===================================================================`);   // <‑‑ log
        //     console.log('io', io);   // <‑‑ log
        //     console.log(`===================================================================`);   // <‑‑ log
        //     console.log('Emit socket cho user', userId, notification.id);
        //     io.to(`user:${userId}`).emit('new-notification', notification);
        // } else {
        //     console.log(`===================================================================`);   // <‑‑ log
        //     console.warn('Không tìm thấy kết nối socket.io.');
        // }

        return { EC: 0, EM: "Tạo thông báo thành công!", DT: notification };
    } catch (error) {
        console.error("Lỗi trong createNotification:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: null };
    }
};

// --------------------------------------------------
export default { 
    getUserNotificationsByUserId,
    createNotification,
    markAsReadNotificationsByNotificationId
};
