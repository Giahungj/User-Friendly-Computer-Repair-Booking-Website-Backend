import storeApiService from '../../services/API/storeApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllStores = async (req, res) => {
    try {
        const result = await storeApiService.allStores();
        return res.json(result);
    } catch (error) {
        console.error('Error in readSpecialties:', error?.message || error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: 1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getStoreDetail = async (req, res) => {
    try {
        const { storeId } = req.params;
        const result = await storeApiService.storeDetail(storeId);
        return res.json(result);
    } catch (error) {
        console.error('Error in readSpecialties:', error?.message || error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: 1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllStores,
    getStoreDetail
}