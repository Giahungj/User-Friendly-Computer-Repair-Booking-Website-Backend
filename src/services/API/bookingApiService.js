import db from "../../models";
import { Op } from "sequelize";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getDataForCreateBookingApiService = async (workScheduleId, userId) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            raw: true, nest: true
        });

        const customer = await db.Customer.findOne({
            attributes: ['customer_id'],
            include: [{
                where: { user_id: userId },
                model: db.User,
                attributes: ['user_id', 'name', 'email', 'phone']
            }],
            raw: true, nest: true
        });
        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: {workSchedule, customer}
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const reassignAndApproveBooking = async ({ bookingId, oldWorkScheduleId, newWorkScheduleId, technicianId }) => {
	try {
		// Lấy booking hiện tại
		const booking = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
			include: [{ model: db.WorkSchedule }]
		});
		console.log("Booking hiện tại:", booking?.toJSON());
		if (!booking) return { EC: 1, EM: "Không tìm thấy đơn đặt lịch", DT: null };
		if (booking.status === "cancelled") return { EC: 2, EM: "Đơn đã bị hủy, không thể đổi kỹ thuật viên", DT: null };

		console.log("Old WorkSchedule ID:", oldWorkScheduleId);
		console.log("New WorkSchedule ID:", newWorkScheduleId);
		console.log("Technician ID:", technicianId);

		// Cập nhật booking sang lịch mới
		await booking.update({ work_schedule_id: newWorkScheduleId });
		console.log("Booking sau khi đổi technician:", booking?.toJSON());

		// Giảm current_number của work schedule cũ
		if (oldWorkScheduleId && oldWorkScheduleId !== newWorkScheduleId) {
			const dec = await db.WorkSchedule.decrement("current_number", {
				by: 1,
				where: { work_schedule_id: oldWorkScheduleId, current_number: { [Op.gt]: 0 } }
			});
			console.log("Giảm current_number WorkSchedule cũ:", dec);
		}

		// Tăng current_number của work schedule mới
		const inc = await db.WorkSchedule.increment("current_number", {
			by: 1,
			where: { work_schedule_id: newWorkScheduleId }
		});
		console.log("Tăng current_number WorkSchedule mới:", inc);

		// Ghi vào lịch sử
		const history = await db.RepairHistory.create({
			booking_id: bookingId,
			status: booking.status,
			notes: `Đổi kỹ thuật viên thành công (technician_id: ${technicianId})`,
			action_date: new Date()
		});
		console.log("RepairHistory mới tạo:", history?.toJSON());

		return { EC: 0, EM: "Đã đổi kỹ thuật viên thành công", DT: booking };
	} catch (error) {
		console.error("reassignAndApproveBooking error:", error);
		return { EC: -1, EM: "Lỗi khi xử lý đổi kỹ thuật viên và duyệt đơn", DT: null };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getDataForCreateBookingApiService,
    reassignAndApproveBooking
}