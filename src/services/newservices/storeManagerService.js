import db from '../../models';
import bcrypt from 'bcryptjs';
import { Op }  from 'sequelize';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllStoreManager = async (page = 1, searchQuery = '') => {
	try {
		const offset = (page - 1) * 20;

		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ '$User.name$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.email$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.phone$': { [Op.like]: `%${searchQuery}%` } }
			];
		}
		const { count, rows } = await db.StoreManager.findAndCountAll({
			where: whereClause,
			include: [
				{
					model: db.User,
					attributes: ['name', 'phone', 'email']
				},
				{
					model: db.Store,
					attributes: ['store_id', 'name', 'address', 'phone']
				}
			],
			order: [['createdAt', 'DESC']],
			limit: 20,
			offset,
			raw: true, nest: true
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách cửa hàng trưởng thành công',
			DT: {
				managers: rows,
				total: count,
				totalPages: Math.ceil(count / 20)
			}
		};
	} catch (error) {
		console.error('Lỗi getAllStoreManager:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách cửa hàng trưởng',
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createStoreManager = async (data, avatarPath) => {
	try {
		const { name, email, password, phone, store_id} = data;

		const existing = await db.User.findOne({
			where: {
				[Op.or]: [{ email }, { phone }]
			}
		});
		if (existing) {
			return { EC: -1, EM: 'Email hoặc số điện thoại đã tồn tại.' };
		}

		const hash = await bcrypt.hash(password, 10);

		const user = await db.User.create({
			name,
			email,
			password: hash,
			phone,
			avatar: avatarPath
		});

		if (!user || !user.user_id) {
			return { EC: -1, EM: 'Tạo tài khoản người dùng thất bại.' };
		}

		await db.StoreManager.create({
			user_id: user.user_id,
			store_id: store_id
		});

		return { EC: 0, EM: 'Tạo quản lý cửa hàng thành công.' };
	} catch (error) {
		console.error('Error creating store manager:', error);
		return { EC: -1, EM: 'Lỗi server khi tạo quản lý cửa hàng.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getStoreManagerById = async (store_manager_id) => {
	try {
		if (!store_manager_id) {
			return { EC: -1, EM: 'Thiếu mã quản lý cửa hàng.' };
		}

		const storeManager = await db.StoreManager.findOne({
			where: { store_manager_id },
			include: [
				{ model: db.User },
				{ model: db.Store }
			],
			raw: true,
			nest: true
		});
		if (!storeManager) {
			return { EC: -1, EM: 'Không tìm thấy quản lý cửa hàng.' };
		}
		console.log('Store Manager details:', storeManager);
		return {
			EC: 0,
			EM: 'Lấy chi tiết quản lý cửa hàng thành công.',
			DT: storeManager
		};
	} catch (error) {
		console.error('Lỗi getStoreManagerById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết quản lý cửa hàng.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllStoreManager,
    createStoreManager,
    getStoreManagerById
}