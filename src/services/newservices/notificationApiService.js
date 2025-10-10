import db from "../../models/index"
import emailApiService from "./emailApiService";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getUserNotificationsByUserId = async (userId) => {
    try {
        // Lấy ngày hiện tại (bắt đầu từ 00:00:00)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const notifications = await db.Notification.findAll({
            where: { user_id: userId },
            order: [["createdAt", "DESC"]],
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

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const markAsReadNotificationsByNotificationId = async (notificationId) => {
    try {
        await db.Notification.update(
            { is_read: 1 },
            { where: { notification_id: notificationId } }
        );
    } catch (error) {
        console.error("Lỗi trong markAsReadNotificationsByNotificationId:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createNotification = async (userId, message, action = null) => {
    try {
        // Kiểm tra userId có hợp lệ không
        const user = await db.User.findOne({ where: { user_id: userId } });
        if (!user) {
            return { EC: 1, EM: "Người dùng không tồn tại!", DT: null };
        }

        console.log("=============================================================================================")
        console.log("Mã người dùng: ", userId)
        console.log("Nội dung thông báo: ", message)
        console.log("Đường dẫn: ", action)
        console.log("Thông tin gmail: ", user.email)
        console.log("=============================================================================================")

        // // Tạo thông báo mới
        const notification = await db.Notification.create({
            user_id: userId,
            message,
            action,
            isRead: 0
        });

        emailApiService.sendNotificationEmail(user.email, message, action);

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

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default { 
    getUserNotificationsByUserId,
    createNotification,
    markAsReadNotificationsByNotificationId
};
