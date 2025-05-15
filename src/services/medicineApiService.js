import { where } from "sequelize/lib/sequelize";
import db from "../models";
import { asIs, Op } from "sequelize";
import { raw } from "body-parser";

// --------------------------------------------------
const getAllMedicine = async () => {
    try {
        const medicines = await db.Medicines.findAll({
            raw: true, nest: true
        })

        if (!medicines) { 
            return { EM: "Lấy dữ liệu thuốc thất bại!", EC: 1, DT: []}
        }

        return {
            EM: 'Lấy danh sách thuốc thành công',
            EC: 0,
            DT: medicines,
        };
    } catch (error) {
        console.error("Error in createNewBooking:", error);
        return {
            EM: error,
            EC: -1,
            DT: [],
        };
    }
};

// --------------------------------------------------
export default {
    getAllMedicine, 
}