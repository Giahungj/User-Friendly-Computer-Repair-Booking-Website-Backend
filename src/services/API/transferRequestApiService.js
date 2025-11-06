import notificationApiService from "../newservices/notificationApiService";
import db from '../../models';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const transferRequests = async ({ storeManagerId, filters = {}, getAll = false }) => {
    try {
        const whereClause = { store_manager_id: storeManagerId || null };

        // --- Bộ lọc nâng cao ---
        if (filters.status) whereClause.status = filters.status;
        if (filters.technicianId) whereClause.technician_id = filters.technicianId;

        // --- Sắp xếp ---
        const sortBy = filters.sortBy === 'processedAt' ? 'processedAt' : 'createdAt';
        const order = filters.order === 'asc' ? 'asc' : 'desc';

        console.log('whereClause:', whereClause);

        const { count, rows } = await db.TransferRequest.findAndCountAll({
            where: whereClause,
            order: [[sortBy, order]],
            raw: true
        });

        const formattedTransferRequests = await Promise.all(
            rows.map(async (trans) => {
                const [storeManager, fromStore, toStore, technician, admin] = await Promise.all([
                    db.StoreManager.findOne({
                        where: { store_manager_id: trans.store_manager_id },
                        include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
                    }),
                    db.Store.findOne({ where: { store_id: trans.from_store_id }, attributes: ['store_id', 'name'] }),
                    db.Store.findOne({ where: { store_id: trans.to_store_id }, attributes: ['store_id', 'name'] }),
                    db.Technician.findOne({
                        where: { technician_id: trans.technician_id },
                        include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
                    }),
                    db.Admin.findOne({
                        where: { admin_id: trans.admin_id },
                        include: [{ model: db.User, as: "user", attributes: ['name', 'phone', 'email'] }]
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
                    processedBy: admin.user?.name || '',
                    processedAt: trans.processed_at || '',
                    note: trans.note || '',
                    createdAt: trans.createdAt,
                    updatedAt: trans.updatedAt
                };
            })
        );

        let filteredTransferRequests = formattedTransferRequests;

        return {
            EC: 0,
            EM: getAll
                ? 'Lấy tất cả yêu cầu chuyển cửa hàng thành công'
                : 'Lấy danh sách yêu cầu chuyển cửa hàng thành công',
            DT: filteredTransferRequests,
        };
    } catch (error) {
        console.error('Lỗi transferRequests:', error);
        return { EC: -1, EM: 'Lỗi khi lấy danh sách yêu cầu', DT: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    transferRequests,
}