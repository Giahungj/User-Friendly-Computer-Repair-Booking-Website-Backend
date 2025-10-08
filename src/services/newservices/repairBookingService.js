import db from '../../models';
import { Op } from 'sequelize';

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
					include: [
						{ model: db.Technician,
							include: [{ model: db.User, attributes: ['name'] }]
						},
					]
				}
			],
			order: [['createdAt', 'DESC']],
			limit: 20, offset
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
const getRepairBookingById = async (booking_id) => {
	try {
		if (!booking_id) {
			return { EC: -1, EM: 'Thiếu mã đặt lịch.' };
		}

		const booking = await db.RepairBooking.findOne({
			where: { booking_id },
			include: [
				{ model: db.Customer, include: [{ model: db.User }] },
				{
					model: db.WorkSchedule,
					include: [
						{
							model: db.Technician,
							include: [{ model: db.User }, { model: db.Store }]
						}
					]
				},
			],
			raw: true, nest: true
		});

		if (!booking) {
			return { EC: -1, EM: 'Không tìm thấy lịch sửa chữa.' };
		}

		// Tách dữ liệu
		const bookingData = {
			booking_id: booking.booking_id,
			device_type: booking.device_type,
			brand: booking.brand,
			status: booking.status,
			booking_date: booking.booking_date,
			booking_time: booking.booking_time,
			issue_description: booking.issue_description
		};

		const customerData = booking.Customer || {};
		const workScheduleData = booking.WorkSchedule || {};
		const technicianData = booking.WorkSchedule?.Technician || {};
		const storeData = booking.WorkSchedule?.Technician?.Store || {};

		const managerData = await db.StoreManager.findOne({
			include: [
				{ model: db.User, attributes: ['name', 'email', 'phone'] },
				{ model: db.Store, where: { store_id: storeData.store_id }, attributes: ['store_id', 'name', 'address'] }
			],
			nest: true,
		});

		let historyData = await db.RepairHistory.findAll({ 
			where: { booking_id: booking.booking_id }
		});

		// Chuyển thành JSON
		historyData = historyData.map(item => item.get({ plain: true }));

		return {
			EC: 0,
			EM: 'Lấy chi tiết lịch sửa chữa thành công.',
			DT: { bookingData, workScheduleData, customerData, technicianData, storeData, managerData, historyData }
		};
	} catch (error) {
		console.error('Lỗi getRepairBookingById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết lịch sửa chữa.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingsByTechnicianId = async (technicianId) => {
	try {
		const { count, rows } = await db.RepairBooking.findAndCountAll({
			include: [
				{
					model: db.Customer,
					attributes: ['customer_id'],
					include: [{ model: db.User, attributes: ['name', 'email', 'phone'] }]
				},
				{
					model: db.WorkSchedule, attributes: [], where: { technician_id: technicianId },
				}
			],
			order: [['createdAt', 'DESC']],
			limit: 20
		});

		const bookings = rows.map(item => {
			const plain = item.get({ plain: true });
			return {
				booking_id: plain.booking_id,
				customer_name: plain.Customer?.User?.name || '-',
				booking_date: plain.booking_date,
				device_type: plain.device_type,
				status: plain.status
			};
		});

		return {
			EC: 0,
			EM: 'Lấy danh sách lịch đặt thành công',
			DT: bookings
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
export default {
    getAllRepairBooking,
	getRepairBookingById,
	getBookingsByTechnicianId
}