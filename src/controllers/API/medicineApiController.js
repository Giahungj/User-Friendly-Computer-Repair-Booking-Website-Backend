import medicineApiService from '../../services/medicineApiService';
import { formatDate } from '../../utils/formatUtil';

// --------------------------------------------------
const readMedicines = async (req, res) => {
    try {
        let data = await medicineApiService.getAllMedicine();
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: ""
        });
    }
};

// --------------------------------------------------
export default {
    readMedicines,
}