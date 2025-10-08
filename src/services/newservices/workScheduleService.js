import db from '../../models/index.js';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getScheduleByTechnicianAndDate = async (technicianId, date) => {
    try {
        if (!technicianId) {
            return {
                EM: "Thiếu technicianId.",
                EC: 1,
                DT: []
            };
        }

        // Lấy thông tin kỹ thuật viên
        const technician = await db.Technician.findOne({
            where: { technician_id: technicianId },
            include: [{ model: db.User, attributes: ['name'] }],
            raw: true,
            nest: true
        });

        if (!technician) {
            return { EM: 'Không tìm thấy kỹ thuật viên', EC: 1, DT: [] };
        }

        // Lấy lịch làm việc
        const whereCondition = { technician_id: technicianId };
        if (date) {
            whereCondition.work_date = date;
        }

        const schedules = await db.WorkSchedule.findAll({
            where: whereCondition,
            order: [['createdAt', 'ASC']],
            raw: true,
            nest: true
        });

        return {
            EM: 'Lấy lịch làm việc thành công',
            EC: 0,
            DT: {
                technicianName: technician.User.name,
                schedules
            }
        };
    } catch (error) {
        return {
            EM: 'Lỗi server: ' + error.message,
            EC: 1,
            DT: []
        };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getScheduleByTechnicianAndDate
};
