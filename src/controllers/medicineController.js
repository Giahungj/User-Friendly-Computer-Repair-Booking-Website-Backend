import db from '../models/index';
import formatUtils from '../utils/formatUtil';
import medicinService from '../services/medicinService';

// --------------------------------------------------
const renderManagerMedicinePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1)
        const medicines = await medicinService.getAllMedicine(page);
        
        return res.render('layouts/layout', {
            page: `pages/medicines/managerMedicinePage.ejs`,
            pageTitle: 'Quản lý thuốc',
            medicines: medicines.DT.medicines,
            mostMedicine: medicines.DT.mostMedicine,
            currentPage: page,
            totalPages: medicines.DT.totalPages,
            totalMedicine: medicines.DT.total,
        })
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}
// --------------------------------------------------
export default {
    renderManagerMedicinePage
}