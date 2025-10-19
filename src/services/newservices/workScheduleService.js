import { raw } from 'express';
import db from '../../models/index.js';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getScheduleByTechnicianAndDate = async (technicianId, date) => {
	try {
		const whereCondition = {};
		let technician = 3;

		if (technicianId) {
			whereCondition.technician_id = technicianId;

			technician = await db.Technician.findOne({
				where: { technician_id: technicianId },
				include: [
					{ model: db.User, attributes: ['name'] },
				],
				raw: true, nest: true
			});
			if (!technician) return { EM: 'Không tìm thấy kỹ thuật viên', EC: 1, DT: [] };
		}

		if (date) whereCondition.work_date = date;

		const schedules = await db.WorkSchedule.findAll({
			where: whereCondition,
			include: [
				{
					model: db.Technician,
					include: [
						{ model: db.User, attributes: ['name'] },
						{ model: db.Store, attributes: ['store_id', 'name', 'address', 'store_image'] }
					]
				}
			],
			order: [['createdAt', 'ASC']],
			raw: true, nest: true
		});

        const schedulesWithStore = schedules.map(s => ({
            ...s,
            storeId: s.Technician?.Store?.store_id || technician?.Store?.store_id || '',
            storeName: s.Technician?.Store?.name || technician?.Store?.name || 'Chưa có cửa hàng',
            storeAddress: s.Technician?.Store?.address || technician?.Store?.address || '',
            storeImage: s.Technician?.Store?.store_image || technician?.Store?.store_image || ''
        }));

		return {
			EM: 'Lấy lịch làm việc thành công',
			EC: 0,
			DT: {
				technicianName: technicianId
					? technician?.User?.name || 'Không xác định'
					: 'Tất cả kỹ thuật viên',
				schedules: schedulesWithStore
			}
		};
	} catch (error) {
		return { EM: 'Lỗi server: ' + error.message, EC: 1, DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getSchedulesByDateAndStore = async ({date, storeId}) => {
	try {
		const whereCondition = {};

		if (date) whereCondition.work_date = date;

		const includeOptions = [
			{
				model: db.Technician,
				include: [
					{ model: db.User, attributes: ['name'] },
					{ model: db.Store, attributes: ['store_id', 'name', 'address', 'store_image'] }
				]
			}
		];

		if (storeId) {
			includeOptions[0].where = { store_id: storeId };
		}

		const schedules = await db.WorkSchedule.findAll({
			where: whereCondition,
			include: includeOptions,
			order: [['createdAt', 'ASC']],
			limit: 10,
			raw: true, nest: true
		});

		const schedulesWithStore = schedules.map(s => ({
			workScheduleId: s.work_schedule_id,
			technicianId: s.Technician?.technician_id || '',
			userId: s.Technician?.user_id || '',
			technicianName: s.Technician?.User?.name || 'Không xác định',
			shift: s.shift,
			workDate: s.work_date,
			storeId: s.Technician?.Store?.store_id || '',
			storeName: s.Technician?.Store?.name || 'Chưa có cửa hàng',
			status: s.current_number < s.max_number ? 0 : 1,
		}));

		return {
			EM: 'Lấy lịch làm việc thành công',
			EC: 0,
			DT: schedulesWithStore
		};
	} catch (error) {
		return { EM: 'Lỗi server: ' + error.message, EC: 1, DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getScheduleByTechnicianAndDate,
	getSchedulesByDateAndStore
};
