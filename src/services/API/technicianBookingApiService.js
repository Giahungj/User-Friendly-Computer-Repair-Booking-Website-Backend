import db from '../../models';
import { Op } from 'sequelize';
import notificationApiService from '../../services/newservices/notificationApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const bookingListOfTechnician = async (technicianId) => {
	try {
		const bookings = await db.RepairBooking.findAll({
            include: [
                { model: db.WorkSchedule, where: { technician_id: technicianId }},
                { model: db.Customer, include: [{ model: db.User }] }
            ],
            order: [["createdAt", "DESC"]]
        });

		return { EC: 0, EM: "Lấy danh sách đơn đặt lịch của kỹ thuật viên thành công", DT: bookings };
	} catch (error) {
		console.error("getWorkSchedulesByTechnician error:", error);
		return { EC: -1, EM: "Lỗi truy vấn danh sách đơn đặt lịch", DT: [] };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const bookingDetailOfTechnician = async (bookingId) => {
	try {
		const bookings = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
			include: [
				{
					model: db.WorkSchedule,
					include: [
						{
							model: db.Technician,
							include: [
								{ model: db.User },
								{ model: db.Specialty }
							]
						}
					]
				},
				{ model: db.Customer, include: [{ model: db.User }] },
				{ model: db.RepairHistory }
			],
			// order: [['updatedAt'], 'DESC']
		});

		return { EC: 0, EM: "Lấy lịch làm việc thành công", DT: bookings };
	} catch (error) {
		console.error("getWorkSchedulesByTechnician error:", error);
		return { EC: -1, EM: "Lỗi truy vấn lịch làm việc", DT: [] };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const technicianProfile = async (technicianId) => {
	try {
		const technician = await db.Technician.findOne({
			where: { technician_id: technicianId },
			include: [
				{ model: db.User },
				{ model: db.Specialty }, // lấy chuyên môn
				{ model: db.Store }
			]
		});

		return { EC: 0, EM: "Lấy hồ sơ kỹ thuật viên thành công", DT: technician };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn hồ sơ kỹ thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const technicianWorkSchedules = async (technicianId) => {
	try {
		const workSchedules = await db.WorkSchedule.findAll({
			include: [
				{ 
					model: db.Technician,
					where: { technician_id: technicianId },
					include: [
						{ 
							model: db.Store
						}
					] 
				}, {
					model: db.RepairBooking,
					attributes: ['booking_id']
				}
			],
			order: [['work_date','DESC']]
		});

		return { EC: 0, EM: "Lấy danh sách lịch làm việc của kỹ thuật viên thành công", DT: workSchedules };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn danh sách lịch làm việ kỹ thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const technicianWorkScheduleDetail = async (scheduleId) => {
	try {
		const workSchedules = await db.WorkSchedule.findOne({
			where: { work_schedule_id: scheduleId },
			include: [
				{
					model: db.Technician,
					include: [{ model: db.Store }, { model: db.User }]
				},
				{
					model: db.RepairBooking,
					include: [
						{ model: db.Customer, include: [{ model: db.User }] },
					]
				}
			]
		});

		return { EC: 0, EM: "Lấy thông tin lịch hẹn của kỹ thuật viên thành công", DT: workSchedules };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn thông tin lịch hẹn của thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const technicianRatings = async (technicianId) => {
	try {
		const ratings = await db.Rating.findAll({
			include: [
				{ model: db.Customer, include: [{ model: db.User }] },
				{
					model: db.Technician,   // lưu ý spelling đúng: Technician
					where: { technician_id: technicianId },
				},
			]
		});

		return { EC: 0, EM: "Lấy đánh giá của kỹ thuật viên thành công", DT: ratings };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn đánh giá của kỹ thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const confirmAndCompleteBooking = async (bookingId) => {
	try {
		const booking = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
			include: [{ model: db.Customer }]
		});

		if (!booking) {
			return { EC: -1, EM: "Không tìm thấy booking", DT: null };
		}
		booking.status = "completed";
		await booking.save();

		const customerUserId = booking.Customer.user_id;

		// Ghi vào lịch sử
		const history = await db.RepairHistory.create({
			booking_id: bookingId,
			status: 'completed',
			notes: `Hoàn thành đơn hàng`,
			action_date: new Date()
		});

		// Gửi thông báo đến khách hàng
		await notificationApiService.createNotification(customerUserId, 'Đơn đặt lịch của bạn đã hoàn thành', `/dat-lich/${bookingId}/thong-tin/chi-tiet`);
		
		return { EC: 0, EM: "Cập nhật trạng thái thành công", DT: booking };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn hoặc cập nhật booking", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	bookingListOfTechnician, 
	bookingDetailOfTechnician, 
	technicianProfile, 
	technicianWorkSchedules,
	technicianWorkScheduleDetail,
	technicianRatings,
	confirmAndCompleteBooking
}
