import notificationApiService from "../../services/notificationApiService";

// --------------------------------------------------
const readUserNotifications = async (req, res) => {
    const userId = req.params.userId
    if (!userId) { return res.status(400).json({EM: "Không tìm thấy dữ liệu!", EC: 1, DT: [] })};
    try {
        const data = await notificationApiService.getUserNotificationsByUserId(userId);
        return res.status(200).json( data )
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
}

// --------------------------------------------------
const markAsReadNotifications = async (req, res) => {
    try {
        const notificationId = req.params.notificationId
        if (!notificationId) { return res.status(400).json({EM: "Không tìm thấy dữ liệu!", EC: 1, DT: [] })};
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