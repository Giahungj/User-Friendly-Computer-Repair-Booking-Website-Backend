import db from '../../models';
import { Op } from 'sequelize'

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const bookingListOfTechnician = async (technicianId, startDate, endDate) => {
	try {
		const bookings = await db.RepairBooking.findAll({
            include: [
                { model: db.WorkSchedule, where: { technician_id: technicianId, work_date: { [Op.between]: [new Date(startDate), new Date(endDate)] } } },
                { model: db.Customer, include: [{ model: db.User }] }
            ],
            order: [[db.WorkSchedule, "work_date", "ASC"]]
        });

		return { EC: 0, EM: "Lấy lịch làm việc thành công", DT: bookings };
	} catch (error) {
		console.error("getWorkSchedulesByTechnician error:", error);
		return { EC: -1, EM: "Lỗi truy vấn lịch làm việc", DT: [] };
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
								{ model: db.Specialty } // thêm ở đây
							]
						}
					]
				},
				{ model: db.Customer, include: [{ model: db.User }] },
				{ model: db.RepairHistory }
			]
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
				{ model: db.Technician, where: { technician_id: technicianId }, include: [{ model: db.Store }] },
			]
		});

		return { EC: 0, EM: "Lấy hồ sơ kỹ thuật viên thành công", DT: workSchedules };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn hồ sơ kỹ thuật viên", DT: null };
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

		return { EC: 0, EM: "Lấy hồ sơ kỹ thuật viên thành công", DT: workSchedules };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn hồ sơ kỹ thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const technicianRating = async (technicianId) => {
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


		return { EC: 0, EM: "Lấy hồ sơ kỹ thuật viên thành công", DT: ratings };
	} catch (error) {
		console.error("technicianProfile error:", error);
		return { EC: -1, EM: "Lỗi truy vấn hồ sơ kỹ thuật viên", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	bookingListOfTechnician, 
	bookingDetailOfTechnician, 
	technicianProfile, 
	technicianWorkSchedules,
	technicianWorkScheduleDetail,
	technicianRating
}
