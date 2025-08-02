import express from "express";
import multer from "multer";
import path from "path";

import homeHomeControllerController from "../controllers/homeController.js";
import AuthAdminController from "../controllers/AuthAdminController";
import technicianController from "../controllers/technicianController.js";
import storeManagerController from '../controllers/storeManagerController';
// import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController.js';
// import facilityController from '../controllers/facilityController';
import repairBookingController from '../controllers/repairBookingController';
import userController from '../controllers/userController';
import storeController from '../controllers/storeController.js';
// import historyController from '../controllers/historyController';
// import scheduleController from '../controllers/scheduleController';
// import pendingDoctorsController from '../controllers/pendingDoctorsController';
// import medicineController from '../controllers/medicineController';
// import serviceController from '../controllers/serviceController';
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

	// 📅 Đặt lịch
	router.get("/admin/dat-lich/danh-sach", repairBookingController.renderRepairBookingListPage);
	router.get("/admin/dat-lich/:id/chi-tiet", repairBookingController.renderRepairBookingDetailPage);
	// router.get("/admin/dat-lich/cho-xac-nhan", controller.getPendingBookings);
	// router.get("/admin/dat-lich/dang-xu-ly", controller.getProcessingBookings);
	// router.get("/admin/dat-lich/hoan-thanh", controller.getCompletedBookings);
	// router.get("/admin/dat-lich/da-huy", controller.getCanceledBookings);

    // 🧑‍💼 Cửa hàng trưởng
    router.get("/admin/cua-hang-truong/danh-sach", storeManagerController.renderStoreManagerListPage);
    router.get("/admin/cua-hang-truong/them-moi", storeManagerController.renderAddStoreManagerPage);
    router.post("/admin/cua-hang-truong/them-moi", upload.single('avatar'), storeManagerController.handleAddStoreManager);
    router.get("/admin/cua-hang-truong/:id/chi-tiet", storeManagerController.renderStoreManagerDetailPage);
    // router.get("/admin/cua-hang-truong", storeManagerController.renderStoreManagerListByQuery);

	// 👨‍🔧 Kỹ thuật viên
    router.get("/admin/ky-thuat-vien/them-moi", technicianController.renderAddTechnicianPage);
    router.post("/admin/ky-thuat-vien/them-moi", upload.single('avatar'), technicianController.handleAddTechnician);
	router.get("/admin/ky-thuat-vien/danh-sach", technicianController.renderTechnicianListPage);
	router.get("/admin/ky-thuat-vien/:id/chi-tiet", technicianController.renderTechnicianDetailPage);
    router.get("/admin/ky-thuat-vien", technicianController.renderTechnicianListByQuery);
	// router.put("/admin/ky-thuat-vien/:id/chinh-sua", controller.updateTechnician);
	// router.get("/admin/ky-thuat-vien/:id/lich-lam-viec", controller.getTechnicianSchedule);

	// 👤 Khách hàng
	router.get("/admin/khach-hang/danh-sach", customerController.renderCustomerListPage);
	router.get("/admin/khach-hang/:id/chi-tiet", customerController.renderCustomerDetailPage);

    // 👨‍💼 Tài khoản
    router.get("/admin/tai-khoan/danh-sach", userController.renderUserListPage);
    router.get("/admin/tai-khoan/:id/chi-tiet", userController.renderUserDetailPage);
    // router.get("/admin/tai-khoan/them-moi", userController.renderAddAccountPage);
    // router.post("/admin/tai-khoan/them-moi", userController.handleAddAccount);
    // router.get("/admin/tai-khoan/:id/chinh-sua", userController.renderEditAccountPage);
    // router.post("/admin/tai-khoan/:id/chinh-sua", userController.handleEditAccount);
    // router.post("/admin/tai-khoan/:id/xoa", userController.handleDeleteAccount);
    // router.post("/admin/tai-khoan/:id/khoi-phuc", userController.handleRestoreAccount);
    // router.get("/admin/tai-khoan/:id/doi-mat-khau", userController.renderChangePasswordPage);
    // router.post("/admin/tai-khoan/:id/doi-mat-khau", userController.handleChangePassword);
    // router.get("/admin/tai-khoan/tim-kiem", userController.handleSearchAccount);

    // 🏪 Cửa hàng
    router.get("/admin/cua-hang/danh-sach", storeController.renderStoreListPage);
    router.get("/admin/cua-hang/them-moi", storeController.renderAddStorePage);
    router.post("/admin/cua-hang/them-moi", upload.single('image'), storeController.handleAddStore);
    router.get("/admin/cua-hang/:id/chi-tiet", storeController.renderStoreDetailPage);
    // router.get("/admin/cua-hang/:id/chinh-sua", storeController.renderEditStorePage);
    // router.post("/admin/cua-hang/:id/chinh-sua", upload.single('image'), storeController.handleEditStore);
    // router.post("/admin/cua-hang/:id/xoa", storeController.handleDeleteStore);

    // 📚 Chuyên môn
    router.get("/admin/chuyen-mon/danh-sach", specialtyController.renderSpecialtyListPage);
    router.get("/admin/chuyen-mon/them-moi", specialtyController.renderAddSpecialtyPage);
    router.post("/admin/chuyen-mon/them-moi", upload.single('image'), specialtyController.handleAddSpecialty);
    // router.get("/admin/chuyen-mon/chinh-sua/:id", SpecialtyController.renderEditSpecialtyForm);
    // router.post("/admin/chuyen-mon/chinh-sua/:id", SpecialtyController.updateSpecialty);
    // router.post("/admin/chuyen-mon/xoa/:id", SpecialtyController.deleteSpecialty);

	// 💻 Thiết bị
	// router.get("/admin/thiet-bi/danh-sach", controller.getAllDevices);
	// router.post("/admin/thiet-bi/them-moi", controller.createDevice);
	// router.put("/admin/thiet-bi/:id/chinh-sua", controller.updateDevice);
	// router.get("/admin/thiet-bi/loai", controller.getDeviceTypes);

	// 🧾 Hóa đơn
	// router.get("/admin/hoa-don/danh-sach", controller.getAllInvoices);
	// router.get("/admin/hoa-don/:id/chi-tiet", controller.getInvoiceDetail);

	// ⚙️ Thiết lập hệ thống
	// router.get("/admin/thiet-lap/ca-lam-viec", controller.getWorkingShifts);
	// router.get("/admin/thiet-lap/trang-thai-don", controller.getBookingStatuses);
	// router.get("/admin/thiet-lap/loai-dich-vu", controller.getServiceTypes);

	return app.use("/", router);
};

export default initWebRoutes;







































    // Dashboard
    // router.get('/search', homeController.renderSearchResultsPage);
    // router.get('/dashboard', homeController.getHomePage);
    // router.get('/test-admin', homeController.getTestAdminPage);

    // Admin routes
    router.get('/admin-login', AuthAdminController.getAdminLoginPage)
    router.post('/admin-login/login', AuthAdminController.handleAdminLogin)
    router.post('/admin-logout', AuthAdminController.handleAdminLogout)

    // User routes
    // router.get('/user', homeController.getUserPage);
    // router.get('/update-user/:id', homeController.getUpdateUserPage);
    // router.post('/users/update-user', homeController.postUpdateUser);
    // router.post('/delete-user/:id', homeController.handleDeleteNewUser);

    // Bác sĩ
    // router.get('/doctor', homeController.getManagerDoctorPage);
    // router.post('/doctor/create-doctor', homeController.handleCreateNewDoctor);
    // router.get('/doctor/update/:id', homeController.getUpdateDoctorPage);
    // router.put('/doctor/update/:id', homeController.handleUpdateDoctor);
    // router.delete('/doctor/delete/:id', homeController.handleDeleteDoctor);

    // Người dùng
    // router.get('/user-detail/:id', userController.getUserDetailPage)
    // router.post('/lock-account', userController.lockAccount)
    // router.post('/unlock-account', userController.unlockAccount)
    
    // Bác sĩ
    // router.get('/manager-doctor', doctorController.renderManagerDoctorPage)
    // router.get('/doctor-detail/:id', doctorController.renderDoctorDetailPage)
    
    // Bệnh nhân
    // router.get('/patient-list', patientController.renderPatientsPage)
    // router.get('/patient-detail/:id', patientController.renderPatientDetailPage)
    
    // Chuyên khoa
    // router.get('/specialty-list', authMiddleware, specialtyController.renderSpecialtiesPage);
    // router.get('/specialty-detail/:id', authMiddleware, specialtyController.renderSpecialtyDetailPage)
    // router.get('/specialty/deleted-specialty-list', specialtyController.renderDeletedSpecialtyListPage)
    // router.post('/specialty/update', upload.single("specialtyImage"), validateInput.validateSpecialtyData, specialtyController.updateSpecialty)
    // router.post('/specialty/create', authMiddleware, upload.single("specialtyImage"), validateInput.validateSpecialtyData, specialtyController.createSpecialty)
    // router.delete('/specialty/delete', authMiddleware, specialtyController.deleteSpecialty)
    // router.delete('/specialty/deleteAll', authMiddleware, specialtyController.deleteAllDeletedSpecialties)
    // router.post('/specialty/restore', authMiddleware, specialtyController.restoreSpecialty)
    // router.post('/specialty/them-bac-si', authMiddleware, specialtyController.addDoctorsToSpecialty)
    // router.post('/specialty/change-doctor-specialty', authMiddleware, doctorController.switchTheDoctorSpecialty)
    
    // Đơn thuốc
    // router.get('/medicine/manager-medicine', authMiddleware, medicineController.renderManagerMedicinePage)

    // Cơ sở y tế
    // router.get('/facility-list', authMiddleware, facilityController.renderFacilitiesPage);
    // router.get('/facility-detail/:id', authMiddleware, facilityController.renderFacilityDetailPage);
    // router.post(
    //     '/facility/create',
    //     authMiddleware, // phải đưa ra ngoài, không lồng trong hàm
    //     upload.fields([
    //         { name: 'mainImage', maxCount: 1 },
    //         { name: 'subImages', maxCount: 20 } // sửa lại tên field
    //     ]),
    //     facilityController.createFacility
    // );
    // router.post('/facility/change-doctor-facility', authMiddleware, doctorController.switchTheDoctorWorkFacility);

    // Đặt chỗ
    // router.get('/booking-list', authMiddleware, bookingController.renderManagerBookingPage);
    // router.get('/booking-detail/:id', authMiddleware, bookingController.renderBookingDetailPage);
    // router.post('/booking-detail/duyet', authMiddleware, bookingController.approveBooking);
    // router.post('/booking-detail/huy', authMiddleware, bookingController.rejectBooking);

    // Lịch làm việc
    // router.get('/manager-schedule', authMiddleware, scheduleController.renderSchedulePage)
    // router.post('/schedule/create', authMiddleware, scheduleController.createSchedule)

    // lịch sử khám
    // router.get('/medical-history-list', authMiddleware, historyController.getMedicalHistoryPage)
    // router.get('/site-intro', authMiddleware, homeController.getSiteintroPage);

    // Phê duyệt
    // router.get('/pending-doctors', authMiddleware, pendingDoctorsController.renderPendingDoctorsPage)
    // router.post('/pending-doctors/pending', authMiddleware, pendingDoctorsController.handlePendingDoctors)

    // Kiểm duyệt gói dịch vụ
    // router.get('/doctor-service/pending-list', authMiddleware, serviceController.renderPendingServicesPage)
    // router.get('/doctor-service/detail', authMiddleware, serviceController.renderEditDoctorServicePage)
    // router.post('/doctor-service/approve', authMiddleware, serviceController.approveServices)
    // router.post('/doctor-service/terminate', authMiddleware, serviceController.terminateService)

    // XEM BIẾN MÀU CỦA HỆ THỐNG
    // router.get('/color', authMiddleware, (req, res) => {
    //     return res.render('layouts/layout', {
    //         page: `pages/colorPage.ejs`,
    //         pageTitle: 'Màu hệ thống',
    //         data: null,
    //         message: null,
    //         EC: null
    //     });
    // });
    
    // Đồng bộ dữ liệu với elasticsearch ---------------------------------------------------------
    // router.post('/sync-doctors-data', authMiddleware, async (req, res) => {
    //     try {
    //         await syncData.syncDoctorsData();
    //         res.status(200).json({ message: 'Data synced successfully' });
    //     } catch (error) {
    //         res.status(500).json({ error: 'Failed to sync data' });
    //     }
    // });
    // router.post('/sync-specialties-data', authMiddleware, async (req, res) => {
    //     try {
    //         await syncData.syncSpecialtiesData();
    //         res.status(200).json({ message: 'Data synced successfully' });
    //     } catch (error) {
    //         res.status(500).json({ error: 'Failed to sync data' });
    //     }
    // });
    // router.post('/sync-facilities-data', authMiddleware, async (req, res) => {
    //     try {
    //         await syncData.syncFacilitiesData();
    //         res.status(200).json({ message: 'Data synced successfully' });
    //     } catch (error) {
    //         res.status(500).json({ error: 'Failed to sync data' });
    //     }
    // });
    // router.post('/sync-patients-data', authMiddleware, async (req, res) => {
    //     try {
    //         await syncData.deletePatientsIndex()
    //         await syncData.initializePatientsMapping();
    //         await syncData.syncPatientsData();
    //         res.status(200).json({ message: 'Data synced successfully' });
    //     } catch (error) {
    //         res.status(500).json({ error: 'Failed to sync data', message: error.message });
    //     }
    // });

    // Lấy liệu với elasticsearch ----------------------------------------------------------------
    // router.get('/getAllDoctorsDataOfElasticSearch', authMiddleware, async (req, res) => {
    //     try {
    //         const result= await getAllDataFromElasticSearch.getAllDoctorsData();
    //         res.status(200).json(result);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
    //     }
    // });
    // router.get('/getAllPatientsDataOfElasticSearch', authMiddleware, async (req, res) => {
    //     try {
    //         const result= await getAllDataFromElasticSearch.getAllPatientsData();
    //         res.status(200).json(result);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
    //     }
    // });
    // router.get('/getAllSpecialtiesDataOfElasticSearch', authMiddleware, async (req, res) => {
	// 	try {
    //         const result = await getAllDataFromElasticSearch.getAllSpecialtiesData();
    //         res.status(200).json(result);
	// 	} catch (error) {
    //         res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
	// 	}
    // });

    // router.get('/getAllFacilitiesDataOfElasticSearch', authMiddleware, async (req, res) => {
    //     try {
    //         const result = await getAllDataFromElasticSearch.getAllFacilitiesData();
    //         res.status(200).json(result);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
    //     }
    // });

    // router.get(/^\/(?!api).*$/, authMiddleware, homeController.render404Page);