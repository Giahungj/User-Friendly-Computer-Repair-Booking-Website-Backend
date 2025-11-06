import db from "../../models";
import { Op } from "sequelize";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createHistory = async ({ bookingId = null, notes = "" }) => {
    try {
        const booking = await db.RepairBooking.findOne({
            where: { booking_id: bookingId },
        });

        if (!booking) {
            return { EC: 1, EM: "Không tìm thấy lịch hẹn", DT: {} };
        }

        const history = await db.RepairHistory.create({
            booking_id: booking.booking_id,
            status: booking.status,
            notes: notes,
            action_date: new Date()
        });

        return { EC: 0, EM: "Tạo lịch sử thao tác của đơn hẹn đã hoàn thành", DT: {} };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn khi tạo lịch", DT: {} };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    createHistory,
};  