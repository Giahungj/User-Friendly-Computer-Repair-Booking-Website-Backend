import db from '../../models';
import { Op } from 'sequelize';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllRepairBooking = async (page = 1, searchQuery = '', filters = '') => {
	try {
		const offset = (page - 1) * 20;
		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ '$Customer.User.name$': { [Op.like]: `%${searchQuery}%` } },
				{ '$Customer.User.email$': { [Op.like]: `%${searchQuery}%` } },
				{ '$Customer.User.phone$': { [Op.like]: `%${searchQuery}%` } },
			];
		}
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value) whereClause[key] = value;
			});
		}
		const { count, rows } = await db.RepairBooking.findAndCountAll({
			where: whereClause,
			include: [
				{
					model: db.Customer,
					attributes: ['customer_id'],
					include: [{ model: db.User, attributes: ['name', 'email', 'phone'] }]
				},
				{
					model: db.WorkSchedule,
					include: [{ model: db.Technician }]
				}
			],
			order: [['createdAt', 'DESC']],
			limit: 20, offset,
			raw: true, nest: true
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách lịch đặt thành công',
			DT: {
				bookings: rows,
				total: count,
				totalPages: Math.ceil(count / 20)
			}
		};
	} catch (error) {
		console.error('Lỗi getAllRepairBooking:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách lịch đặt',
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getRepairBookingById = async (booking_id) => {
	try {
		if (!booking_id) {
			return { EC: -1, EM: 'Thiếu mã đặt lịch.' };
		}
		const booking = await db.RepairBooking.findOne({
			where: { booking_id },
			include: [
				{ model: db.Customer },
				{
					model: db.WorkSchedule,
					include: [
						{
							model: db.Technician,
							include: [{ model: db.User }]
						}
					]
				}
			],
			raw: true,nest: true
		});
		if (!booking) {
			return { EC: -1, EM: 'Không tìm thấy lịch sửa chữa.' };
		}
		return {
			EC: 0,
			EM: 'Lấy chi tiết lịch sửa chữa thành công.',
			DT: booking
		};
	} catch (error) {
		console.error('Lỗi getRepairBookingById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết lịch sửa chữa.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllRepairBooking,
	getRepairBookingById
}