import { where } from "sequelize/lib/sequelize";
import db from "../models";

// ---------------------------------------------------------
const createRating = async (ratingData) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        console.log("ratingData", ratingData);
        const newRating = await db.Rating.create(ratingData);
        if (!newRating) {
            return { EM: "Không thể tạo đánh giá!", EC: -1, DT: [] };
        }
        const patient = await db.Patient.findOne({
            where: { id: ratingData.patientId },
            include: [{ model: db.User }]
        })
        const doctor = await db.Doctors.findOne({
            where: { id: ratingData.doctorId},
        })

        const notification = {
            userId: doctor.userId,
            message: `Bạn có một đánh giá từ bệnh nhân ${patient.User.name}`,
            action: `/doctor/manager-booking/booking-history/detail/${ratingData.bookingId}`,
            isRead: 0
        }
        const newNotification = await db.Notification.create(notification)
        if (!newNotification) { return { EM: "Gửi thông báo thất bại!", EC: 1, DT: null  }}
        return { EM: "Tạo thành công đánh giá!", EC: 0, DT: newRating  };
    } catch (error) {
        console.error("Lỗi khi tạo đánh giá:", error);
        return { EC: -1, EM: "Lỗi hệ thống! Không thể tạo đánh giá.", DT: null };
    }
}


// ---------------------------------------------------------
export default {
    createRating
}