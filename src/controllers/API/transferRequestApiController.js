import transferRequestService from '../../services/API/transferRequestApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTransferRequestsByStoreManager = async (req, res) => {
    try {
        const { storeManagerId } = req.params;
        const status = req.query.status?.trim() || '';
        const technicianId = req.query.technicianId?.trim() || '';
        const sortBy = req.query.sortBy === 'processedAt' ? 'processedAt' : 'createdAt';
        const order = req.query.order === 'asc' ? 'asc' : 'desc';

        if (!storeManagerId || isNaN(storeManagerId)) {
            return res.status(200).json({ EC: 1, EM: 'Thiếu hoặc sai mã quản lý', DT: null });
        }

        const filters = {
            status,
            technicianId,
            sortBy,
            order
        };

        const result = await transferRequestService.transferRequests({
            storeManagerId: parseInt(storeManagerId),
            filters,
            getAll: false
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("readTransferRequestsByStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: -1, DT: {} });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readTransferRequestsByStoreManager,
};