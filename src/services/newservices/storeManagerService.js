import db from '../../models';
import bcrypt from 'bcryptjs';
import { Op }  from 'sequelize';
import { where } from 'sequelize/lib/sequelize';

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
// Kiểm tra email/phone đã tồn tại
const checkUserExists = async (email, phone) => {
	const existing = await db.User.findOne({
		where: { [Op.or]: [{ email }, { phone }] }
	});
	return existing ? true : false;
};

// Tạo user + store manager + gán store
const createStoreManagerRecord = async (data, avatarPath) => {
	const { name, email, password, phone, store_id } = data;
	const hash = await bcrypt.hash(password, 10);

	return await db.sequelize.transaction(async (t) => {
		const user = await db.User.create({
			name, email, password: hash, phone, avatar: avatarPath, role: 1
		}, { transaction: t });

		if (!user || !user.user_id) throw new Error('Tạo tài khoản người dùng thất bại.');

		const storeManager = await db.StoreManager.create({
			user_id: user.user_id
		}, { transaction: t });

		const [updated] = await db.Store.update(
			{ store_manager_id: storeManager.store_manager_id },
			{ where: { store_id }, transaction: t }
		);

		if (!updated) throw new Error('Cập nhật cửa hàng thất bại.');

		return { EC: 0, EM: 'Tạo quản lý cửa hàng thành công.', DT: {} };
	});
};

// Hàm chính gọi
const createStoreManager = async (data, avatarPath) => {
	try {
		const exists = await checkUserExists(data.email, data.phone);
		if (exists) return { EC: -1, EM: 'Email hoặc số điện thoại đã tồn tại.' };

		const result = await createStoreManagerRecord(data, avatarPath);
		return result;
	} catch (error) {
		console.error('Error creating store manager:', error);
		return { EC: -1, EM: 'Lỗi server khi tạo quản lý cửa hàng.' };
	}
};

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
// Cập nhật thông tin cửa hàng trưởng
const updateStoreManager = async (user_id, data) => { 
	try {
		if (!user_id) return { EC: -1, EM: 'Thiếu mã quản lý cửa hàng.' };

		const { name, email, phone, store_id, avatar } = data;

		const updateData = { name, email, phone };
		if (avatar) updateData.avatar = avatar;

		const result = await db.sequelize.transaction(async (t) => {
			// 1. Cập nhật User
			const [updatedRows] = await db.User.update(updateData, { where: { user_id }, transaction: t });
			if (!updatedRows) throw new Error('Cập nhật thông tin người dùng thất bại.');

			// 2. Lấy storeManagerId từ bảng StoreManager
			const storeManager = await db.StoreManager.findOne({ where: { user_id }, transaction: t });
			if (!storeManager) throw new Error('Không tìm thấy StoreManager.');

			// 3. Lấy cửa hàng cũ mà manager đang quản lý
			const oldStore = await db.Store.findOne({ where: { store_manager_id: storeManager.store_manager_id }, transaction: t });

			// 4. Cập nhật cửa hàng mới nếu có store_id
			if (store_id) {
				await db.Store.update(
					{ store_manager_id: null },
					{ where: { store_id: oldStore.store_id }, transaction: t }
				);
				const [updatedStore] = await db.Store.update(
					{ store_manager_id: storeManager.store_manager_id },
					{ where: { store_id }, transaction: t }
				);
				if (!updatedStore) throw new Error('Cập nhật cửa hàng thất bại.');
			}

			return { EC: 0, EM: 'Cập nhật quản lý cửa hàng thành công.', DT: { storeManagerId: storeManager.store_manager_id } };
		});

		return result;
	} catch (error) {
		console.error('Error updating store manager:', error);
		return { EC: -1, EM: 'Lỗi server khi cập nhật quản lý cửa hàng.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Xóa cửa hàng trưởng
const deleteStoreManager = async (store_manager_id) => {
	try {
		if (!store_manager_id) return { EC: -1, EM: 'Thiếu mã quản lý cửa hàng.' };

		const result = await db.sequelize.transaction(async (t) => {
			// 1. Lấy StoreManager
			const storeManager = await db.StoreManager.findOne({ where: { store_manager_id }, transaction: t });
			if (!storeManager) throw new Error('Không tìm thấy StoreManager.');

			const userId = storeManager.user_id;

			// 2. Set store_manager_id của cửa hàng đang quản lý về null
			const updatedStores = await db.Store.update(
				{ store_manager_id: null },
				{ where: { store_manager_id }, transaction: t }
			);

			// 3. Xóa StoreManager
			const deletedStoreManager = await db.StoreManager.destroy({ where: { store_manager_id }, transaction: t });
			console.log('Số bản ghi StoreManager đã xóa:', deletedStoreManager);

			// 4. Xóa User
			const deletedUser = await db.User.destroy({ where: { user_id: userId }, transaction: t });
			console.log('Số bản ghi User đã xóa:', deletedUser);

			return { EC: 0, EM: 'Xóa quản lý cửa hàng thành công.' };
		});

		return result;
	} catch (error) {
		console.error('Error deleting store manager:', error);
		return { EC: -1, EM: 'Lỗi server khi xóa quản lý cửa hàng.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllStoreManager,
    getStoreManagerById,
    createStoreManager,
	updateStoreManager,
	deleteStoreManager
}