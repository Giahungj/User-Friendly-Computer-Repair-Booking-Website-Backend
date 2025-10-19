import db from '../../models';
import { Op } from "sequelize"

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllStore = async (page = 1, searchQuery = '') => {
	try {
		const offset = (page - 1) * 20;
		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ '$Store.name$': { [Op.like]: `%${searchQuery}%` } },
				{ '$Store.address$': { [Op.like]: `%${searchQuery}%` } },
				{ '$Store.phone$': { [Op.like]: `%${searchQuery}%` } },
			];
		}
		const { count, rows } = await db.Store.findAndCountAll({
			attributes: ['store_id', 'name', 'address', 'phone', 'createdAt'],
			where: whereClause,
			include: [{
				model: db.StoreManager,
				attributes: ['store_manager_id'],
				include: [{ model: db.User, attributes: ['user_id', 'name', 'avatar']}],
				required: false
			}],
			order: [['updatedAt', 'DESC']],
			limit: 20,
			offset,
			raw: true,
			nest: true
		});

		return {
			EC: 0,
			EM: 'Lấy danh sách cửa hàng thành công',
			DT: {
				stores: rows,
				total: count,
				totalPages: Math.ceil(count / 20)
			}
		};
	} catch (error) {
		console.error('Lỗi getAllStore:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách cửa hàng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getStoresSuport = async () => {
	try {
		const stores = await db.Store.findAll({
			include: [{
				model: db.StoreManager,
				attributes: ['store_manager_id'],
				required: false
			}],
			where: {
				'$StoreManager.store_manager_id$': null
			},
			attributes: ['store_id', 'name', 'address', 'phone', 'createdAt'],
			order: [['updatedAt', 'DESC']],
			raw: true,
			nest: true
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách cửa hàng thành công',
			DT: { stores }
		};
	} catch (error) {
		console.error('Lỗi getAllStore:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách cửa hàng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllStoreSuport = async () => {
	try {
		const stores = await db.Store.findAll({
			attributes: ['store_id', 'name'],
			order: [['updatedAt', 'DESC']],
			raw: true
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách cửa hàng thành công',
			DT: stores
		};
	} catch (error) {
		console.error('Lỗi getAllStore:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách cửa hàng',
			DT: []
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getStoreById = async (store_id) => {
	try {
		const store = await db.Store.findOne({
			where: { store_id },
			raw: true, nest: true
		});
		if (!store) {
			return { EC: -1, EM: 'Không tìm thấy cửa hàng.', DT: null };
		}
		return {
			EC: 0,
			EM: 'Lấy chi tiết cửa hàng thành công.',
			DT: store
		};
	} catch (error) {
		console.error('Lỗi getStoreById:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy thông tin cửa hàng.',
			DT: null
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createStore = async (data, imagePath) => {
    try {
        const { name, address, phone } = data;

        if (!name || !address || !phone) {
            return { EC: -1, EM: 'Thiếu thông tin cửa hàng.' };
        }

        const existing = await db.Store.findOne({ where: { name: name } });
        if (existing) {
            return { EC: -1, EM: 'Tên cửa hàng đã tồn tại.' };
        }

        await db.Store.create({
            name,
            address,
            phone,
            store_image: imagePath
        });

        return { EC: 0, EM: 'Tạo Cửa hàng thành công.' };
    } catch (error) {
        console.error('Error creating specialty:', error);
        return { EC: -1, EM: 'Lỗi server khi tạo cửa hàng.' };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateStore = async (data) => {
	const t = await db.sequelize.transaction();
	try {
		const { storeId, name, phone, address, storeImage } = data;

		if (!name || !phone || !address) {
			await t.rollback();
			return { EC: -1, EM: 'Thiếu tên, số điện thoại hoặc địa chỉ cửa hàng.' };
		}

		const existing = await db.Store.findOne({
			where: { 
				name, 
				store_id: { [Op.ne]: storeId } 
			},
			transaction: t
		});
		if (existing) {
			await t.rollback();
			return { EC: -1, EM: 'Tên cửa hàng đã tồn tại.' };
		}

		const updateData = { name, phone, address };
		if (storeImage) updateData.store_image = storeImage;

		await db.Store.update(updateData, {
			where: { store_id: storeId },
			transaction: t
		});

		await t.commit();
		return { EC: 0, EM: 'Cập nhật cửa hàng thành công.' };
	} catch (error) {
		await t.rollback();
		return { EC: -1, EM: 'Cập nhật cửa hàng thất bại.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getAllStore,
	getStoresSuport,
	getAllStoreSuport,
	getStoreById,
	createStore,
	updateStore
};
