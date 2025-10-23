import db from '../../models';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getWorkScheduleByTechnician = async (technicianId) => {
    try {
        const schedules = await db.WorkSchedule.findAll({
            attributes: ['work_schedule_id', 'work_date', 'max_number', 'current_number', 'shift'],
            where: {
                technician_id: technicianId,
                work_date: {
                    [Op.gte]: new Date()
                }
            },
            order: [['work_date', 'ASC']], // gần nhất trước
            raw: true,
            nest: true
        });

        if (!schedules || schedules.length === 0) {
            return { EC: 0, EM: 'Không tìm thấy lịch làm việc', DT: [] };
        }

        const grouped = schedules.reduce((acc, item) => {
            if (!acc[item.work_date]) acc[item.work_date] = [];
            acc[item.work_date].push(item);
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, items]) => ({
            work_date: date,
            items
        }));

        return {
            EC: 0,
            EM: 'Lấy lịch làm việc thành công',
            DT: result
        };
    } catch (error) {
        console.error(`Error in getWorkScheduleByTechnician (id ${technicianId}):`, error.message);
        return {
            EC: -1,
            EM: error.message || 'Lỗi server',
            DT: []
        };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkWorkSchedulesByStoreManagerApiService = async (storeManagerId, schedules) => {
    try {
        if (!storeManagerId) return { EC: 1, EM: "Thiếu storeManagerId", DT: [] };
        if (!schedules || (Array.isArray(schedules) && schedules.length === 0)) {
            return { EC: 1, EM: "Dữ liệu không hợp lệ", DT: [] };
        }

        const technicians = await db.Technician.findAll({
            attributes: ["technician_id"],
            include: [{ model: db.Store, attributes: [], where: { store_manager_id: storeManagerId } }],
            raw: true,
        });
        const technicianIds = technicians.map((tech) => tech.technician_id);

        const invalidSchedules = schedules.filter(
            (s) => !technicianIds.includes(s.technician_id)
        );
        if (invalidSchedules.length > 0) {
            return {
                EC: 1,
                EM: "Một hoặc nhiều kỹ thuật viên không thuộc quyền quản lý của cửa hàng trưởng",
                DT: invalidSchedules,
            };
        }

        const scheduleArray = Array.isArray(schedules) ? schedules : [schedules];
        const existingSchedules = await db.WorkSchedule.findAll({
            where: {
                [Op.or]: scheduleArray.map((s) => ({
                    technician_id: s.technician_id,
                    work_date: s.work_date,
                    shift: s.shift,
                })),
            },
            raw: true,
        });

        if (existingSchedules.length > 0) {
            return {
                EC: 2,
                EM: "Một hoặc nhiều lịch làm việc đã tồn tại",
                DT: existingSchedules,
            };
        }

        return { EC: 0, EM: "Hợp lệ, chưa có lịch trùng", DT: [] };
    } catch (error) {
        console.error("Error in checkWorkSchedules:", error.message);
        return { EC: -1, EM: error.message || "Lỗi server", DT: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createWorkSchedulesByStoreManagerApiService = async (storeManagerId, schedules) => {
	try {
		// Kiểm tra trước khi thêm
		const checkResult = await checkWorkSchedulesByStoreManagerApiService(storeManagerId, schedules);
		if (checkResult.EC !== 0) {
			return checkResult;
		}

		const scheduleArray = Array.isArray(schedules) ? schedules : [schedules];
		const created = await db.WorkSchedule.bulkCreate(scheduleArray, {
			validate: true,
			ignoreDuplicates: true,
		});

		// Lấy lại danh sách đã tạo kèm Technician.User
		const ids = created.map((c) => c.work_schedule_id);
		const fullData = await db.WorkSchedule.findAll({
			where: { work_schedule_id: ids },
			include: [
				{
					model: db.Technician,
					include: [
						{ model: db.User, attributes: ["user_id", "name", "email", "phone", "avatar"] },
					],
				},
			],
		});

		// Chuyển về JSON gọn
		const schedulesJson = fullData.map((item) => {
			return {
				work_schedule_id: item.work_schedule_id,
				technician_id: item.technician_id,
				work_date: item.work_date,
				shift: item.shift,
				max_number: item.max_number,
				current_number: item.current_number,
				Technician: item.Technician
					? {
							technician_id: item.Technician.technician_id,
							User: item.Technician.User,
					  }
					: null,
			};
		});

		return { EC: 0, EM: "Thêm lịch làm việc thành công", DT: schedulesJson };
	} catch (error) {
		console.error("Error in createWorkSchedules:", error.message);
		return { EC: -1, EM: error.message || "Lỗi server", DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getWorkScheduleByTechnician,
    createWorkSchedulesByStoreManagerApiService
}