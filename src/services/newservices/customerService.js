import db from '../../models';
import { Op } from 'sequelize';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllCustomers = async (page = 1, searchQuery = '') => {
	try {
		const offset = (page - 1) * 20;

		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ '$User.name$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.email$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.phone$': { [Op.like]: `%${searchQuery}%` } },
			];
		}

		const { count, rows } = await db.Customer.findAndCountAll({
			attributes: ['customer_id', 'address', 'preferred_contact', 'loyalty_points'],
			where: whereClause,
			include: [
				{
					model: db.User,
					attributes: ['user_id', 'name', 'email', 'phone', 'createdAt', 'last_active'],
				}
			],
			order: [['createdAt', 'DESC']],
			limit: 20,
			offset,
			raw: true,
			nest: true,
		});

		return {
			EC: 0,
			EM: 'Lấy danh sách khách hàng thành công',
			DT: {
				customers: rows,
				total: count,
				totalPages: Math.ceil(count / 20)
			}
		};
	} catch (error) {
		console.error('Lỗi getAllCustomers:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách khách hàng',
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getCustomerById = async (customer_id) => {
	try {
		if (!customer_id) {
			return { EC: -1, EM: 'Thiếu mã khách hàng.' };
		}
		const customer = await db.Customer.findOne({
			where: { customer_id },
			include: [{
				model: db.User,
				attributes: ['user_id', 'name', 'email', 'phone']
			}],
			attributes: ['customer_id', 'address', 'date_of_birth', 'preferred_contact', 'loyalty_points', 'last_active', 'createdAt'],
			raw: true,
			nest: true
		});
		if (!customer) {
			return { EC: -1, EM: 'Không tìm thấy khách hàng.' };
		}
		console.log('getCustomerById:', customer);
		return {
			EC: 0,
			EM: 'Lấy chi tiết khách hàng thành công.',
			DT: customer
		};
	} catch (error) {
		console.error('Lỗi getCustomerById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết khách hàng.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getAllCustomers,
	getCustomerById,
};
