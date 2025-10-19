import { where } from 'sequelize/lib/sequelize';
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
			order: [['updatedAt', 'DESC']],
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
			order: [['updatedAt', 'DESC']],
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
const getRepairBookingsByStoreId = async ({ date, storeId }) => {
	try {
		const { count, rows } = await db.RepairBooking.findAndCountAll({
			where: { booking_date: date },
			include: [
				{
					model: db.WorkSchedule,
					include: [
						{ model: db.Technician, include: [
							{ model: db.Store, where: { store_id: storeId } }
						] },

					]
				}
			]
		});

		const totalOrders = count;
		const processedOrders = rows.filter(b => b.status === 'completed').length;
		const activeTechnicians = new Set(rows.map(b => b.WorkSchedule?.technician_id)).size;
		const openStores = 1; // hoặc lấy từ bảng Store nếu có trạng thái mở

		return {
			EC: 0,
			EM: 'Lấy thống kê nhanh thành công',
			DT: {
				quickStats: {
					totalOrders,
					processedOrders,
					activeTechnicians,
					openStores
				}
			}
		};
	} catch (error) {
		console.error('Lỗi getAllRepairBooking:', error);
		return { EC: -1, EM: 'Lỗi khi lấy danh sách đơn', DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getLateRepairBookings = async ({ date, storeId }) => {
	try {
		const today = new Date();
		const threeDaysAgo = new Date(today);
		threeDaysAgo.setDate(today.getDate() - 3); 

		// 1. Lấy danh sách kỹ thuật viên thuộc store
		const technicians = await db.Technician.findAll({
			where: { store_id: storeId },
			attributes: ['technician_id']
		});
		const technicianIds = technicians.map(t => t.technician_id);

		// 2. Lấy danh sách lịch làm việc của kỹ thuật viên đó
		const schedules = await db.WorkSchedule.findAll({
			where: { technician_id: { [Op.in]: technicianIds } },
			attributes: ['work_schedule_id']
		});
		const scheduleIds = schedules.map(s => s.work_schedule_id);

		// 3. Lấy danh sách đơn đặt lịch trễ quá 3 ngày
		const bookings = await db.RepairBooking.findAll({
			where: {
				booking_date: { [Op.lte]: threeDaysAgo },
				status: { [Op.notIn]: ['completed', 'cancelled'] },
				work_schedule_id: { [Op.in]: scheduleIds }
			},
			include: [
				{
					model: db.WorkSchedule,
					include: [
						{
							model: db.Technician,
							include: [
								{ model: db.Store },
								{ model: db.User }
							]
						}
					]
				},
				{
					model: db.Customer,
					include: [{ model: db.User }]
				}
			]
		});

		const result = bookings.map(b => {
			const bookingDate = new Date(b.booking_date);
			const diffDays = Math.floor((today - bookingDate) / (1000 * 60 * 60 * 24));

			return {
				bookingId: b.booking_id,
				technicianName: b.WorkSchedule?.Technician?.User?.name || null,
				customerName: b.Customer?.User?.name || null,
				status: b.status || null,
				daysLate: diffDays,
				bookingDate: b.booking_date
			};
		});

		return {
			EC: 0,
			EM: 'Lấy danh sách đơn trễ hơn 3 ngày thành công',
			DT: result
		};
	} catch (error) {
		console.error('Lỗi getLateRepairBookings:', error);
		return { EC: -1, EM: 'Lỗi khi lấy danh sách đơn trễ', DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllRepairBooking,
	getRepairBookingById,
	getBookingsByTechnicianId,
	getRepairBookingsByStoreId,
	getLateRepairBookings
}