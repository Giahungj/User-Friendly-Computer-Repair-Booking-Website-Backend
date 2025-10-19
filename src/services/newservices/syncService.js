import db from '../../models';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getSyncErrors = async () => {
	try {
		// Lấy alert lỗi Store
		const storeAlertsResponse = await checkStoreErrors();
		const storeAlerts = storeAlertsResponse.DT;
		
        // Lấy alert lỗi Technician
        const technicianAlertsResponse = await checkTechnicianErrors();
		const technicianAlerts = technicianAlertsResponse.DT;
        
        // Lấy alert lỗi WorkSchedule
        const workScheduleAlertsResponse = await checkWorkScheduleErrors();
		const workScheduleAlerts = workScheduleAlertsResponse.DT;
        
        // Lấy alert lỗi RepairBooking
        const repairBookingAlertsResponse = await checkRepairBookingErrors();
		const repairBookingAlerts = repairBookingAlertsResponse.DT;
        
        // Lấy alert lỗi Customer
        const customerAlertsResponse = await checkCustomerErrors();
		const customerAlerts = customerAlertsResponse.DT;
        
        // Lấy alert lỗi User
        const userAlertsResponse = await checkUserErrors();
		const userAlerts = userAlertsResponse.DT;
        
		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi toàn bộ thành công',
			DT: [
                ...storeAlerts, 
                ...technicianAlerts, 
                ...workScheduleAlerts, 
                ...repairBookingAlerts,
                ...customerAlerts,
                ...userAlerts
            ]
		};
	} catch (error) {
		console.error('Lỗi getSyncErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy dữ liệu',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkStoreErrors = async () => {
	try {
		const stores = await db.Store.findAll({
			where: {
				[Op.or]: [
					{ name: null },
					{ address: null },
					{ phone: null },
					{ store_image: null },
					{ store_manager_id: null }
				]
			},
			attributes: ['store_id', 'name', 'address', 'phone', 'store_image', 'store_manager_id']
		});

		const alerts = stores.map(s => {
			const messages = [];
			if (!s.name) messages.push(`Cửa hàng (ID: ${s.store_id}) - Thiếu tên cửa hàng`);
			if (!s.address) messages.push(`Cửa hàng (ID: ${s.store_id}) - Thiếu địa chỉ cửa hàng`);
			if (!s.phone) messages.push(`Cửa hàng (ID: ${s.store_id}) - Thiếu số điện thoại`);
			if (!s.store_image) messages.push(`Cửa hàng (ID: ${s.store_id}) - Thiếu hình ảnh`);
			if (!s.store_manager_id) messages.push(`Cửa hàng (ID: ${s.store_id}) - Thiếu quản lý cửa hàng`);

			return messages.map(msg => ({ storeId: s.store_id, message: msg }));
		}).flat();

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi cửa hàng thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkStoreErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu cửa hàng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkCustomerErrors = async () => {
	try {
		const customers = await db.Customer.findAll({
			where: {
				[Op.or]: [
					{ user_id: null },
					{ address: null },
					{ date_of_birth: null },
					{ preferred_contact: null }
				]
			},
			attributes: ['customer_id', 'user_id', 'address', 'date_of_birth', 'preferred_contact', 'loyalty_points']
		});

		const alerts = customers.map(c => {
			const messages = [];
			if (!c.user_id) messages.push(`Khách hàng (ID: ${c.customer_id}) - Thiếu liên kết tài khoản người dùng`);
			if (!c.address) messages.push(`Khách hàng (ID: ${c.customer_id}) - Thiếu địa chỉ`);
			if (!c.date_of_birth) messages.push(`Khách hàng (ID: ${c.customer_id}) - Thiếu ngày sinh`);
			if (!c.preferred_contact) messages.push(`Khách hàng (ID: ${c.customer_id}) - Thiếu thông tin liên hệ ưu tiên`);

			return messages.map(msg => ({ customerId: c.customer_id, message: msg }));
		}).flat();

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi khách hàng thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkCustomerErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu khách hàng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkUserErrors = async () => {
	try {
		const users = await db.User.findAll({
			where: {
				[Op.or]: [
					{ name: null },
					{ email: null },
					{ password: null },
					{ role: null },
					{ phone: null },
					{ avatar: null }
				]
			},
			attributes: ['user_id', 'name', 'email', 'password', 'role', 'phone', 'avatar', 'last_active']
		});

		const alerts = users.map(u => {
			const messages = [];
			if (!u.name) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu tên`);
			if (!u.email) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu email`);
			if (!u.password) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu mật khẩu`);
			if (!u.role) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu vai trò`);
			if (!u.phone) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu số điện thoại`);
			if (!u.avatar) messages.push(`Người dùng (ID: ${u.user_id}) - Thiếu ảnh đại diện`);

			return messages.map(msg => ({ userId: u.user_id, message: msg }));
		}).flat();

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi người dùng thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkUserErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu người dùng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkTechnicianErrors = async () => {
	try {
		const technicians = await db.Technician.findAll({
			where: {
				[Op.or]: [
					{ user_id: null },
					{ store_id: null },
					{ avg_rating: null }
				]
			},
			attributes: ['technician_id', 'user_id', 'store_id', 'avg_rating']
		});

		const alerts = technicians.map(t => {
			const messages = [];
			if (!t.user_id) messages.push(`Kỹ thuật viên (ID: ${t.technician_id}) - Thiếu thông tin người dùng`);
			if (!t.store_id) messages.push(`Kỹ thuật viên (ID: ${t.technician_id}) - Thiếu cửa hàng`);
			if (t.avg_rating === null) messages.push(`Kỹ thuật viên (ID: ${t.technician_id}) - Thiếu đánh giá trung bình`);

			return messages.map(msg => ({ technicianId: t.technician_id, message: msg }));
		}).flat();

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi kỹ thuật viên thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkTechnicianErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu kỹ thuật viên',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkRepairBookingErrors = async () => {
	try {
		const bookings = await db.RepairBooking.findAll({
			include: [
				{
					model: db.WorkSchedule,
					include: [
						{
							model: db.Technician,
							include: [
								{ model: db.Store, required: false },
								{ model: db.User, required: false }
							],
							required: false
						}
					],
					required: false
				},
				{
					model: db.Customer,
					include: [{ model: db.User, required: false }],
					required: false
				}
			]
		});

		const alerts = bookings.flatMap(b => {
			const messages = [];

			// Trường trong bảng RepairBooking
			if (!b.customer_id) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu khách hàng`);
			if (!b.work_schedule_id) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu lịch làm việc`);
			if (!b.device_type) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu loại thiết bị`);
			if (!b.issue_description) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu mô tả sự cố`);
			if (!b.booking_date) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu ngày đặt`);
			if (!b.booking_time) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu giờ đặt`);
			if (!b.status) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu trạng thái`);
			if (!b.issue_image) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu ảnh thiết bị`);

			// Kiểm tra WorkSchedule
			const ws = b.WorkSchedule;
			if (!ws) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Không tìm thấy lịch làm việc`);
			else {
				if (!ws.technician_id) messages.push(`Lịch làm việc (ID: ${ws.work_schedule_id}) - Thiếu kỹ thuật viên`);
				if (!ws.work_date) messages.push(`Lịch làm việc (ID: ${ws.work_schedule_id}) - Thiếu ngày làm việc`);
				if (!ws.shift) messages.push(`Lịch làm việc (ID: ${ws.work_schedule_id}) - Thiếu ca làm việc`);
			}

			// Kiểm tra Technician
			const tech = ws?.Technician;
			if (!tech) messages.push(`Lịch làm việc (ID: ${ws?.work_schedule_id || 'N/A'}) - Thiếu thông tin kỹ thuật viên`);
			else {
				if (!tech.user_id) messages.push(`Kỹ thuật viên (ID: ${tech.technician_id}) - Thiếu user_id`);
				if (!tech.store_id) messages.push(`Kỹ thuật viên (ID: ${tech.technician_id}) - Thiếu store_id`);
			}

			// Kiểm tra Store
			const store = tech?.Store;
			if (!store) messages.push(`Kỹ thuật viên (ID: ${tech?.technician_id || 'N/A'}) - Thiếu thông tin cửa hàng`);
			else {
				if (!store.name) messages.push(`Cửa hàng (ID: ${store.store_id}) - Thiếu tên cửa hàng`);
				if (!store.address) messages.push(`Cửa hàng (ID: ${store.store_id}) - Thiếu địa chỉ`);
			}

			// Kiểm tra Customer
			const customer = b.Customer;
			if (!customer) messages.push(`Đơn đặt (ID: ${b.booking_id}) - Thiếu thông tin khách hàng`);
			else {
				if (!customer.user_id) messages.push(`Khách hàng (ID: ${customer.customer_id}) - Thiếu user_id`);
			}

			// Kiểm tra User của Customer
			const customerUser = customer?.User;
			if (!customerUser) messages.push(`Khách hàng (ID: ${customer?.customer_id || 'N/A'}) - Thiếu tài khoản người dùng`);
			else {
				if (!customerUser.name) messages.push(`Người dùng (ID: ${customerUser.user_id}) - Thiếu tên`);
				if (!customerUser.email) messages.push(`Người dùng (ID: ${customerUser.user_id}) - Thiếu email`);
			}

			// Kiểm tra User của Technician
			const techUser = tech?.User;
			if (!techUser) messages.push(`Kỹ thuật viên (ID: ${tech?.technician_id || 'N/A'}) - Thiếu tài khoản người dùng`);
			else {
				if (!techUser.name) messages.push(`Người dùng (ID: ${techUser.user_id}) - Thiếu tên`);
				if (!techUser.email) messages.push(`Người dùng (ID: ${techUser.user_id}) - Thiếu email`);
			}

			return messages.map(msg => ({
				bookingId: b.booking_id,
				customerName: customerUser?.name || null,
				technicianName: techUser?.name || null,
				storeName: store?.name || null,
				message: msg
			}));
		});

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi đơn đặt thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkRepairBookingErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu đơn đặt',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const checkWorkScheduleErrors = async () => {
	try {
		const schedules = await db.WorkSchedule.findAll({
			where: {
				[Op.or]: [
					{ technician_id: null },
					{ work_date: null },
					{ shift: null },
					{ max_number: null },
					{ current_number: null }
				]
			},
			attributes: ['work_schedule_id', 'technician_id', 'work_date', 'shift', 'max_number', 'current_number']
		});

		const alerts = schedules.map(s => {
			const messages = [];
			if (!s.technician_id) messages.push(`Lịch làm việc (ID: ${s.work_schedule_id}) - Thiếu kỹ thuật viên`);
			if (!s.work_date) messages.push(`Lịch làm việc (ID: ${s.work_schedule_id}) - Thiếu ngày làm việc`);
			if (!s.shift) messages.push(`Lịch làm việc (ID: ${s.work_schedule_id}) - Thiếu ca làm việc`);
			if (s.max_number === null) messages.push(`Lịch làm việc (ID: ${s.work_schedule_id}) - Thiếu số lượng tối đa`);
			if (s.current_number === null) messages.push(`Lịch làm việc (ID: ${s.work_schedule_id}) - Thiếu số lượng hiện tại`);

			return messages.map(msg => ({ workScheduleId: s.work_schedule_id, message: msg }));
		}).flat();

		return {
			EC: 0,
			EM: 'Lấy dữ liệu lỗi lịch làm việc thành công',
			DT: alerts
		};
	} catch (error) {
		console.error('Lỗi checkWorkScheduleErrors:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi kiểm tra dữ liệu lịch làm việc',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getSyncErrors,
}