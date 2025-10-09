import { where } from 'sequelize/lib/sequelize';
import db from '../../models';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const allStores = async () => {
    try {
        const stores = await db.Store.findAll({
            attributes: ['store_id', 'name', 'address', 'store_manager_id', 'phone'],
        });

        if (!stores || stores.length === 0) {
            return {
                EM: "Không tìm thấy cửa hàng nào",
                EC: -1,
                DT: []
            };
        }

        return {
            EM: "Lấy danh sách cửa hàng thành công",
            EC: 0,
            DT: stores
        };
    } catch (error) {
        console.error("Lỗi trong getAllStores:", error.message);
        return {
            EM: error.message || "Lỗi server",
            EC: -1,
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const storeDetail = async (storeId) => {
    try {
        const store = await db.Store.findOne({
            where: { store_id: storeId },
            attributes: ['store_id', 'name', 'address', 'store_manager_id', 'phone'],
            include: [{
                model: db.Technician,
                attributes: ['technician_id', 'avg_rating'], // bổ sung nếu muốn
                include: [{
                    model: db.Specialty,
                    attributes: ['specialty_id', 'name'],
                    through: { attributes: [] }
                }, {
                    model: db.User,
                    attributes:['user_id', 'name', 'email', 'phone', 'avatar']
                }]
            }]
        });


        if (!store || store.length === 0) {
            return {
                EM: "Không tìm thấy cửa hàng nào",
                EC: -1,
                DT: []
            };
        }

        return {
            EM: "Lấy thông tin cửa hàng thành công",
            EC: 0,
            DT: store
        };
    } catch (error) {
        console.error("Lỗi trong getAllStores:", error.message);
        return {
            EM: error.message || "Lỗi server",
            EC: -1,
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    allStores,
    storeDetail
    // Các storeDetail khác...
};