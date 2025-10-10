import db from "../../models";
import { Op } from "sequelize";
import notificationApiService from "../newservices/notificationApiService";
import { where } from "sequelize/lib/sequelize";

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
			include: [{ model: db.WorkSchedule }, { model: db.Customer }]
		});

		if (!booking) return { EC: 1, EM: "Không tìm thấy đơn đặt lịch", DT: null };
		if (booking.status === "cancelled") return { EC: 2, EM: "Đơn đã bị hủy, không thể đổi kỹ thuật viên", DT: null };

		// Tạo nội dung thông báo cho kỹ thuật viên và khách hàng
		const technician = await db.Technician.findOne({
			where: { technician_id: technicianId },
		})
		if (!booking.Customer.user_id) return { EC: 1, EM: "Không tìm thấy thông tin khách hàng", DT: null };
		const customerUserId = booking.Customer.user_id;
		if (!technician) return { EC: 1, EM: "Không tìm thấy thông tin kỹ thuật viên", DT: null };
		const technicianUserId = technician.user_id;

		// Cập nhật booking sang lịch mới
		await booking.update({ work_schedule_id: newWorkScheduleId });

		// Giảm current_number của work schedule cũ
		if (oldWorkScheduleId && oldWorkScheduleId !== newWorkScheduleId) {
			const dec = await db.WorkSchedule.decrement("current_number", {
				by: 1,
				where: { work_schedule_id: oldWorkScheduleId, current_number: { [Op.gt]: 0 } }
			});
		}

		// Tăng current_number của work schedule mới
		const inc = await db.WorkSchedule.increment("current_number", {
			by: 1,
			where: { work_schedule_id: newWorkScheduleId }
		});

		// Ghi vào lịch sử
		const history = await db.RepairHistory.create({
			booking_id: bookingId,
			status: booking.status,
			notes: `Đổi kỹ thuật viên thành công (technician_id: ${technicianId})`,
			action_date: new Date()
		});

		// Gửi thông báo đến khách hàng
		await notificationApiService.createNotification(customerUserId, 'Đơn đặt lịch của bạn đã được đổi sang cho kỹ thuật viên mới', `/dat-lich/${bookingId}/thong-tin/chi-tiet`);

		// Gửi thông báo đến kỹ thuật viên
		await notificationApiService.createNotification(technicianUserId, 'Bạn vừa được cửa hàng trưởng đổi đơn đặt lịch', '/ky-thuat-vien/don-dat-lich/danh-sach');

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