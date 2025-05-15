import { where } from "sequelize/lib/sequelize";
import db from "../models";
import formatUtils from '../utils/formatUtil';

// ---------------------------------------------------------
const getAllMedicine = async (page = 1) => {
    try {
        const offset = (page - 1) * 10;
        const medicines = await db.Medicines.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: offset,
            raw: true,
            nest: true
        });

        const { fn, col } = db.Sequelize;

        const a = await db.Prescriptions.findOne({
            include: [{
                model: db.Medicines,
                attributes: ['name']
            }],
            attributes: [
                [fn('SUM', col('quantity')), 'totalQuantity']
            ],
            group: ['medicineId', 'Medicine.name'],
            raw: true,
            nest: true
        });
        
        const result = {
            totalQuantity: a.totalQuantity,
            name: a.Medicine.name
        };
        
        if (!medicines || medicines.count === 0) {
            return {
                EC: -1,
                EM: 'Không tìm thấy thuốc',
                DT: []
            };
        }

        const { count, rows } = medicines;

        return {
            EM: 'Lấy danh sách thuốc thành công',
            EC: 0,
            DT: {
                medicines: rows,
                mostMedicine: result,
                total: count,
                totalPages: Math.ceil(count / 10)
            }
        };
    } catch (error) {
        console.error(error);
        return {
            EM: "Lỗi server ...",
            EC: -1,
            DT: []
        };
    }
};

// ---------------------------------------------------------
export default {
    getAllMedicine,
}