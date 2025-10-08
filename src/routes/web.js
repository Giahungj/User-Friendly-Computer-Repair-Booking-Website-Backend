import express from "express";
import multer from "multer";
import path from "path";

import homeHomeControllerController from "../controllers/homeController.js";
import AuthAdminController from "../controllers/AuthAdminController";
import technicianController from "../controllers/technicianController.js";
import storeManagerController from '../controllers/storeManagerController';
import specialtyController from '../controllers/specialtyController.js';
import workScheduleController from '../controllers/workScheduleController.js';
import repairBookingController from '../controllers/repairBookingController';
import userController from '../controllers/userController';
import storeController from '../controllers/storeController.js';
import reportsController from '../controllers/reportsController.js';
import syncData from '../utils/syncData';
import getAllDataFromElasticSearch from '../utils/getAllDataFromElasticSearch';

import validateInput from "../middleware/validateInput";
import authMiddleware from "../middleware/authMiddleware"
import homeController from "../controllers/homeController.js";
import customerController from "../controllers/customerController.js";
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/images/uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
const initWebRoutes = (app) => {
   // Trang chủ
    router.get('/', homeController.getHomePage);
    router.get('/overview', homeController.getOverview);
    router.get('/bookings/statistics', homeController.getBookingStats);
    router.get('/customers/statistics', homeController.getCustomerStats);
    router.post('/reports/export', homeController.exportReport);

	// 📅 Đặt lịch
	router.get("/admin/dat-lich/danh-sach", repairBookingController.renderRepairBookingListPage);
	router.get("/admin/dat-lich/:id/chi-tiet", repairBookingController.renderRepairBookingDetailPage);

    // 🧑‍💼 Cửa hàng trưởng
    router.get("/admin/cua-hang-truong/danh-sach", storeManagerController.renderStoreManagerListPage);
    router.get("/admin/cua-hang-truong/them-moi", storeManagerController.renderAddStoreManagerPage);
    router.post("/admin/cua-hang-truong/them-moi", upload.single('avatar'), storeManagerController.handleAddStoreManager);
    router.get("/admin/cua-hang-truong/:id/chi-tiet", storeManagerController.renderStoreManagerDetailPage);
    router.get("/admin/cua-hang-truong/:storeManagerId/cap-nhat", storeManagerController.renderEditStoreManagerPage);
    router.post("/admin/cua-hang-truong/:user_id/cap-nhat", upload.single('avatar'),storeManagerController.handleEditStoreManagerPage);
    router.post("/admin/cua-hang-truong/:storeManagerId/xoa", storeManagerController.handleDeleteStoreManager);

	// 👨‍🔧 Kỹ thuật viên
    router.get("/admin/ky-thuat-vien/them-moi", technicianController.renderAddTechnicianPage);
    router.post("/admin/ky-thuat-vien/them-moi", upload.single('avatar'), technicianController.handleAddTechnician);
	router.get("/admin/ky-thuat-vien/danh-sach", technicianController.renderTechnicianListPage);
	router.get("/admin/ky-thuat-vien/:id/chi-tiet", technicianController.renderTechnicianDetailPage);
    router.get("/admin/ky-thuat-vien", technicianController.renderTechnicianListByQuery);
    router.get('/reports/performance', reportsController.getPerformanceReport)
	// router.put("/admin/ky-thuat-vien/:id/chinh-sua", controller.updateTechnician);
	// router.get("/admin/ky-thuat-vien/:id/lich-lam-viec", controller.getTechnicianSchedule);

	// 👤 Khách hàng
	router.get("/admin/khach-hang/danh-sach", customerController.renderCustomerListPage);
	router.get("/admin/khach-hang/:id/chi-tiet", customerController.renderCustomerDetailPage);

    // 👨‍💼 Tài khoản
    router.get("/admin/tai-khoan/danh-sach", userController.renderUserListPage);
    router.get("/admin/tai-khoan/:id/chi-tiet", userController.renderUserDetailPage);

    // 👨‍💼 Tài khoản
    router.get("/admin/lich-lam-viec/danh-sach", workScheduleController.renderWorkSchedulePage);

    // 🏪 Cửa hàng
    router.get("/admin/cua-hang/danh-sach", storeController.renderStoreListPage);
    router.get("/admin/cua-hang/them-moi", storeController.renderAddStorePage);
    router.post("/admin/cua-hang/them-moi", upload.single('image'), storeController.handleAddStore);
    router.get("/admin/cua-hang/:id/chi-tiet", storeController.renderStoreDetailPage);
    
    // 📚 Chuyên môn
    router.get("/admin/chuyen-mon/danh-sach", specialtyController.renderSpecialtyListPage);
    router.get("/admin/chuyen-mon/them-moi", specialtyController.renderAddSpecialtyPage);
    router.post("/admin/chuyen-mon/them-moi", upload.single('image'), specialtyController.handleAddSpecialty);
    
    // Admin routes
    router.get('/admin-login', AuthAdminController.getAdminLoginPage)
    router.post('/admin-login/login', AuthAdminController.handleAdminLogin)
    router.post('/admin-logout', AuthAdminController.handleAdminLogout)

	return app.use("/", router);
};

export default initWebRoutes;

