import { where } from 'sequelize/lib/sequelize';
import notificationApiService from "./notificationApiService";
import db from '../../models';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const transferRequests = async ({ page = 1, searchQuery = '', filters = {}, getAll = false }) => {
	try {
		const limit = 20;
		const offset = (page - 1) * limit;

		const whereClause = {};

		// --- Tìm kiếm chung ---
		if (searchQuery) {
			whereClause[Op.or] = [
				{ reason: { [Op.like]: `%${searchQuery}%` } },
				{ status: { [Op.like]: `%${searchQuery}%` } }
			];
		}

		// --- Bộ lọc nâng cao ---
		if (filters.status) whereClause.status = filters.status;
		if (filters.technicianId) whereClause.technician_id = filters.technicianId;
		if (filters.storeManagerId) whereClause.store_manager_id = filters.storeManagerId;

		if (filters.fromDate && filters.toDate) {
			whereClause.createdAt = {
				[Op.between]: [new Date(filters.fromDate), new Date(filters.toDate)]
			};
		}

		const { count, rows } = await db.TransferRequest.findAndCountAll({
			where: whereClause,
			order: [['createdAt', 'DESC']],
			limit: getAll ? undefined : limit,
			offset: getAll ? undefined : offset,
			raw: true
		});

		const formattedTransferRequests = await Promise.all(
			rows.map(async (trans) => {
				const [storeManager, fromStore, toStore, technician] = await Promise.all([
					db.StoreManager.findOne({
						where: { store_manager_id: trans.store_manager_id },
						include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
					}),
					db.Store.findOne({ where: { store_id: trans.from_store_id }, attributes: ['store_id', 'name'] }),
					db.Store.findOne({ where: { store_id: trans.to_store_id }, attributes: ['store_id', 'name'] }),
					db.Technician.findOne({
						where: { technician_id: trans.technician_id },
						include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
					})
				]);

				return {
					transferRequestId: trans.transfer_request_id,
					technician: {
						id: technician?.technician_id,
						name: technician?.User?.name || null,
						phone: technician?.User?.phone || null,
						email: technician?.User?.email || null
					},
					storeManager: {
						id: storeManager?.store_manager_id,
						name: storeManager?.User?.name || null,
						phone: storeManager?.User?.phone || null,
						email: storeManager?.User?.email || null
					},
					fromStore: { id: fromStore?.store_id, name: fromStore?.name || null },
					toStore: { id: toStore?.store_id, name: toStore?.name || null },
					reason: trans.reason,
					status: trans.status,
					processedBy: trans.admin_id || '',
					processedAt: trans.processed_at || '',
					note: trans.note || '',
					createdAt: trans.createdAt,
					updatedAt: trans.updatedAt
				};
			})
		);

		return {
			EC: 0,
			EM: getAll
				? 'Lấy tất cả yêu cầu chuyển cửa hàng thành công'
				: 'Lấy danh sách yêu cầu chuyển cửa hàng thành công',
			DT: {
				transferRequests: formattedTransferRequests,
				total: count,
				totalPages: getAll ? 1 : Math.ceil(count / limit)
			}
		};
	} catch (error) {
		console.error('Lỗi transferRequests:', error);
		return { EC: -1, EM: 'Lỗi khi lấy danh sách yêu cầu', DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const transferRequest = async (transferRequestId) => {
	try {
		if (!transferRequestId || isNaN(transferRequestId)) {
			return { EC: 1, EM: 'Thiếu hoặc sai mã yêu cầu chuyển cửa hàng', DT: null };
		}

		const trans = await db.TransferRequest.findOne({
			where: { transfer_request_id: transferRequestId },
			raw: true
		});

		if (!trans) {
			return { EC: 2, EM: 'Không tìm thấy yêu cầu chuyển cửa hàng', DT: null };
		}

		const [storeManager, fromStore, toStore, technician, admin] = await Promise.all([
			db.StoreManager.findOne({
				where: { store_manager_id: trans.store_manager_id },
				include: [{ model: db.User, attributes: ['name','phone','email','avatar'] }]
			}),
			db.Store.findOne({ where: { store_id: trans.from_store_id }, attributes: ['store_id','name'] }),
			db.Store.findOne({ where: { store_id: trans.to_store_id }, attributes: ['store_id','name'] }),
			db.Technician.findOne({
				where: { technician_id: trans.technician_id },
				include: [{ model: db.User, attributes: ['name','phone','email','avatar'] }]
			}),
			db.Admin.findOne({
				where: { admin_id: trans.admin_id },
				include: [{
					model: db.User,
					as: 'user',
					attributes: ['name','phone','email','avatar'],
					required: false
				}]
			})
		]);

		const formatted = {
			transferRequestId: trans.transfer_request_id,
			technician: {
				id: technician?.technician_id || null,
				name: technician?.User?.name || null,
				phone: technician?.User?.phone || null,
				email: technician?.User?.email || null,
				avatar: technician?.User?.avatar || null
			},
			storeManager: {
				id: storeManager?.store_manager_id || null,
				name: storeManager?.User?.name || null,
				phone: storeManager?.User?.phone || null,
				email: storeManager?.User?.email || null,
				avatar: storeManager?.User?.avatar || null
			},
			fromStore: { id: fromStore?.store_id || null, name: fromStore?.name || null },
			toStore: { id: toStore?.store_id || null, name: toStore?.name || null },
			reason: trans.reason,
			status: trans.status,
			processedBy: admin ? (admin.user?.name || '') : '',
			processedAt: trans.processed_at || '',
			note: trans.note || '',
			createdAt: trans.createdAt,
			updatedAt: trans.updatedAt
		};

		return { EC: 0, EM: 'Lấy chi tiết yêu cầu chuyển cửa hàng thành công', DT: formatted };
	} catch (error) {
		console.error('Lỗi getTransferRequestById:', error);
		return { EC: -1, EM: 'Lỗi khi lấy chi tiết yêu cầu', DT: null };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateTransferRequest = async ({ storeManagerId, technicianId, transferRequestId, note }) => {
	console.log(" ================================================= SERVICE ================================================= ");
	console.log("Input:", { transferRequestId, storeManagerId, technicianId, note });

	const transaction = await db.sequelize.transaction();

	try {
		console.log("=> Bắt đầu tìm TransferRequest");
		const trans = await db.TransferRequest.findOne({
			where: {
				transfer_request_id: transferRequestId,
				store_manager_id: storeManagerId,
				technician_id: technicianId
			},
			transaction
		});

		if (!trans) {
			console.log("=> Không tìm thấy TransferRequest");
			await transaction.rollback();
			return { EC: 2, EM: 'Không tìm thấy yêu cầu chuyển cửa hàng', DT: null };
		}
		console.log("=> TransferRequest tìm thấy:", trans.transfer_request_id);

		console.log("=> Cập nhật note và processed info");
		await trans.update(
			{
				note: note || '',
				status: 'approved',
				admin_id: 1,
				processed_at: new Date()
			},
			{ transaction }
		);

		await transaction.commit();

		// console.log("=> Lấy user_id của StoreManager và Technician");
		// const [storeManagerUser, technicianUser] = await Promise.all([
		// 	db.StoreManager.findOne({
		// 		where: { store_manager_id: storeManagerId },
		// 		attributes: ['user_id'],
		// 	}),
		// 	db.Technician.findOne({
		// 		where: { technician_id: technicianId },
		// 		attributes: ['user_id'],
		// 	})
		// ]);

		// if (!storeManagerUser || !technicianUser) {
		// 	console.log("=> Không tìm thấy user_id tương ứng");
		// 	await transaction.rollback();
		// 	return { EC: 3, EM: 'Không tìm thấy user_id tương ứng', DT: null };
		// }

		// const storeManagerUserId = storeManagerUser.user_id;
		// const technicianUserId = technicianUser.user_id;
		// console.log("=> storeManagerUserId:", storeManagerUserId, "technicianUserId:", technicianUserId);

		// console.log("=> Gửi thông báo đến storeManager và technician");
		// await notificationApiService.createNotification(
		// 	storeManagerUserId,
		// 	'Đơn yêu cầu của bạn đã được xử lý! Vui lòng kiểm tra',
		// 	'',
		// 	transaction
		// );

		// await notificationApiService.createNotification(
		// 	technicianUserId,
		// 	'Bạn vừa được quản trị viên xử lý chuyển cửa hàng làm việc! Vui lòng kiểm tra',
		// 	'',
		// 	transaction
		// );

		const transfer = await transferRequest(transferRequestId);

		console.log("=> Transaction commit thành công");
		return { EC: 0, EM: 'Cập nhật phản hồi thành công', DT: transfer.DT };
	} catch (error) {
		await transaction.rollback();
		console.error("=> Lỗi trong transaction:", error);
		return { EC: -1, EM: 'Lỗi khi cập nhật phản hồi', DT: null };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    transferRequests,
	transferRequest,
	updateTransferRequest
}