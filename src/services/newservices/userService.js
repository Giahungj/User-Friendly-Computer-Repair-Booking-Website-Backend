import db from '../../models';
import { Op } from 'sequelize';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllUsers = async (page = 1, searchQuery = '') => {
	try {
		const offset = (page - 1) * 20;

		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ name: { [Op.like]: `%${searchQuery}%` } },
				{ email: { [Op.like]: `%${searchQuery}%` } },
				{ phone: { [Op.like]: `%${searchQuery}%` } },
			];
		}
		const users = await db.User.findAll({
			attributes: ['user_id', 'name', 'email', 'phone', 'avatar', 'last_active', 'createdAt', 'updatedAt'],
			where: whereClause,
			order: [['createdAt', 'DESC']],
			limit: 20,
			offset,
			raw: true,
			nest: true,
		});
		const technicianIds = (await db.Technician.findAll({ attributes: ['user_id'], raw: true })).map(t => t.user_id);
		const adminIds = (await db.Admin.findAll({ attributes: ['user_id'], raw: true })).map(a => a.user_id);
		const usersWithRole = users.map(user => {
			let role = 'Khách hàng';
			if (technicianIds.includes(user.user_id)) role = 'Kỹ thuật viên';
			else if (adminIds.includes(user.user_id)) role = 'Quản trị viên';
			return { ...user, role };
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách tài khoản thành công',
			DT: {usersWithRole, total: users.length, totalPages: Math.ceil(users.length / 20)},
		};
	} catch (error) {
		console.error('Lỗi getAllUsers:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách tài khoản',
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getUserById = async (user_id) => {
	try {
		if (!user_id) {
			return { EC: -1, EM: 'Thiếu mã tài khoản.' };
		}
		const user = await db.User.findOne({
			where: { user_id },
			attributes: ['user_id', 'name', 'email', 'phone'],
			raw: true, nest: true
		});
		if (!user) {
			return { EC: -1, EM: 'Không tìm thấy tài khoản.' };
		}
		console.log('getUserById:', user);
		return {
			EC: 0,
			EM: 'Lấy chi tiết tài khoản thành công.',
			DT: user
		};
	} catch (error) {
		console.error('Lỗi getCustomerById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết tài khoản.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getAllUsers,
	getUserById
};
