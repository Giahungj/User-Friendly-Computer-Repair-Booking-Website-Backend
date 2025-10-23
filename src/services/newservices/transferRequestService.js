import { where } from 'sequelize/lib/sequelize';
import db from '../../models';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const transferRequests = async () => {
    try {
        const transferRequests = await db.TransferRequest.findAll({
            order: [['createdAt', 'DESC']],
            raw: true
        });

        const formattedTransferRequests = [];

        for (const trans of transferRequests) {
            const storeManager = await db.StoreManager.findOne({
                where: { store_manager_id: trans.store_manager_id },
                include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
            });

            const fromStore = await db.Store.findOne({
                where: { store_id: trans.from_store_id }, attributes: ['store_id', 'name'] 
            });

            const toStore = await db.Store.findOne({
                where: { store_id: trans.to_store_id }, attributes: ['store_id', 'name'] 
            });

            const technician = await db.Technician.findOne({
                where: { technician_id: trans.technician_id },
                include: [{ model: db.User, attributes: ['name', 'phone', 'email'] }]
            });

            formattedTransferRequests.push({
                transferRequestId: trans.transfer_request_id,
                technician: {
                    id: technician.technician_id,
                    name: technician.User?.name || null,
                    phone: technician.User?.phone || null,
                    email: technician.User?.email || null
                },
                storeManager: {
                    id: storeManager.store_manager_id,
                    name: storeManager.User?.name || null,
                    phone: storeManager.User?.phone || null,
                    email: storeManager.User?.email || null
                },
                fromStore: {
                    id: fromStore.store_id,
                    name: fromStore.name || null
                },
                toStore: {
                    id: toStore.store_id,
                    name: toStore.name || null
                },
                reason: trans.reason,
                status: trans.status === 'pending'  ? 'Đang chờ duyệt': trans.status === 'approved' 
                                                    ? 'Đã duyệt' : trans.status === 'rejected' 
                                                    ? 'Từ chối' : trans.status,
                processedBy: trans.admin_id || '',
                processedAt: trans.processed_at || '',
                note: trans.note || '',
                createdAt: trans.createdAt,
                updatedAt: trans.updatedAt
            });
        }

        console.log(formattedTransferRequests);

        return {
            EC: 0,
            EM: 'Lấy danh sách tất cả yêu cầu chuyển cửa hàng thành công',
            DT: formattedTransferRequests
        };
    } catch (error) {
        console.error('Lỗi getAllTransferRequestsForAdmin:', error);
        return { EC: -1, EM: 'Lỗi khi lấy danh sách yêu cầu', DT: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    transferRequests,
}