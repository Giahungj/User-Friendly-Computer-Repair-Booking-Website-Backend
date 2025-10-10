import notificationApiService from "../../services/newservices/notificationApiService";

// --------------------------------------------------
const readUserNotifications = async (req, res) => {
    const { userId } = req.params
    if (!userId) { return res.json({EM: "Không có thông báo mới!", EC: 1, DT: [] })};
    
    try {
        const data = await notificationApiService.getUserNotificationsByUserId(userId);
        return res.json(data)
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server 2!",
            EC: "-1",
            DT: []
        });
    }
}

// --------------------------------------------------
const markAsReadNotifications = async (req, res) => {
    try {
        const { notificationId } = req.params
        if (!notificationId) { return res.json({EM: "Không tìm thấy dữ liệu!", EC: 1, DT: [] })};
        await notificationApiService.markAsReadNotificationsByNotificationId(notificationId);
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
}

// --------------------------------------------------
export default {
    readUserNotifications ,
    markAsReadNotifications
};