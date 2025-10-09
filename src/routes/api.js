import express from "express";
import multer from "multer";
import path from "path";

import loginApiController from "../controllers/API/loginApiController";
import forgotPasswordApiController from "../controllers/API/forgotPasswordApiController";
import registerApiController from "../controllers/API/registerApiController";
import accountApiController from "../controllers/API/accountApiController";
import technicianApiController from "../controllers/API/technicianApiController";
import specialtyApiController from "../controllers/API/specialtyApiController";
import storeApiController from "../controllers/API/storeApiController";
import workScheduleApiController from "../controllers/API/workScheduleApiController";
import ratingApiController from "../controllers/API/ratingApiController";
import bookingApiController from "../controllers/API/bookingApiController";
import technicianBookingApiController from "../controllers/API/technicianBookingApiController";
import statisticApiController from "../controllers/API/statisticApiController";
import notificationApiService from "../controllers/API/notificationApiController";

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/images/uploads")),
	filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const initApiRoutes = (app) => {
	// =========================
	// KHÁCH HÀNG
	// =========================
	router.post('/sign-up', registerApiController.handleSignUpNewUser);
	router.post('/sign-in-email', loginApiController.signInByEmail);
	router.post('/sign-in-phone', loginApiController.signInByPhone);

	// Notification
	router.get('/notifications/:userId', notificationApiService.readUserNotifications);

	// Booking
	router.get('/dat-lich/tao-lich-moi/:workScheduleId/:userId/lay-du-lieu', bookingApiController.readDataForCreateBookingApiController);
	router.post('/dat-lich/tao-lich-hen-moi/them-moi', upload.single('issueImage'), bookingApiController.createBookingApiController);
	router.post('/dat-lich/:bookingId/huy-lich', bookingApiController.cancelBookingApiController);
	router.post('/dat-lich/:bookingId/cap-nhat', upload.single("issueImage"), bookingApiController.updateBookingApiController);
	router.get('/dat-lich/khach-hang/:userId/danh-sach', bookingApiController.readCustomerBookingsApiController);
	router.get('/dat-lich/:bookingId/thong-tin/chi-tiet', bookingApiController.readBookingByIdApiController);

	// Specialty
	router.get('/chuyen-mon/danh-sach', specialtyApiController.readSpecialties);

	// Store
	router.get('/cua-hang/danh-sach', storeApiController.getAllStores);
	router.get('/cua-hang/:storeId/thong-tin/chi-tiet', storeApiController.getStoreDetail);

	// Technician
	router.get('/ky-thuat-vien/danh-sach', technicianApiController.readTechnicians);
	router.get('/ky-thuat-vien/:id/thong-tin/chi-tiet', technicianApiController.readTechnicianDetail);
	router.get('/ky-thuat-vien/:id/thong-tin/lich-lam-viec', workScheduleApiController.readWorkScheduleByTechnician);
	router.get('/ky-thuat-vien/:id/thong-tin/danh-gia', ratingApiController.readTechnicianRatingsApiController);
	router.get('/ky-thuat-vien/:technicianId/thong-tin/ky-thuat-vien-tuong-tu', technicianApiController.readSimilarTechniciansApiController);

	// =========================
	// KỸ THUẬT VIÊN
	// =========================
	router.post('/sign-in-email/technician', loginApiController.signInByEmailForTechnician);
	router.post('/sign-in-phone/technician', loginApiController.signInByPhoneForTechnician);

	router.get('/:technicianId/laydanhsachdondatlich', technicianBookingApiController.getBookingListByTechnician);
	router.get('/laydondatlich/:bookingId', technicianBookingApiController.getBookingDetailByTechnician);
	router.post('/don-dat-lich/xac-nhan-hoan-thanh-don', technicianBookingApiController.handleConfirmAndCompleteBooking);
	router.get('/lichlamviec/:technicianId', technicianBookingApiController.getWorkScheduleByTechnician);
	router.get('/chitietlichlamviec/:scheduleId', technicianBookingApiController.getTechnicianWorkScheduleDetail);
	router.get('/hoso/:technicianId', technicianBookingApiController.getTechnicianProfile);
	router.get('/danhgia/:technicianId', technicianBookingApiController.getTechnicianRating);


	// =========================
	// CỬA HÀNG TRƯỞNG
	// =========================
	// Login
	router.post('/sign-in-email/store-manager', loginApiController.signInByEmailForStoreManager);
	router.post('/sign-in-phone/store-manager', loginApiController.signInByPhoneForStoreManager);

	// Technician Management
	router.get('/cua-hang-truong/ky-thuat-vien/lich-lam-viec', technicianApiController.readTechnicianSchedulesForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/con-trong', technicianApiController.readAvailableTechniciansForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/doi-lich', technicianApiController.readAvailableTechniciansForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/danh-sach', technicianApiController.readAllTechniciansForStoreManagerApiController);
	router.post('/cua-hang-truong/:storeManagerId/ky-thuat-vien/tao-moi', upload.single('avatar'), technicianApiController.handleCreateTechnicianForStoreManagerApiController);
	router.put('/cua-hang-truong/ky-thuat-vien/:technicianId/cap-nhat', technicianApiController.handleUpdateTechnicianForStoreManagerApiController);

	// Booking Management
	router.get('/cua-hang-truong/:storeManagerId/don-dat-lich/danh-sach', bookingApiController.readAllBookingForStoreManagerApiController);
	router.get('/cua-hang-truong/don-dat-lich/:repair_booking_id/chi-tiet', bookingApiController.fuckYouApiController);
	router.put('/cua-hang-truong/don-dat-lich/duyet-don', bookingApiController.approveRepairBookingController);
	router.put('/cua-hang-truong/don-dat-lich/doi-nguoi-sua-chua', bookingApiController.reassignAndApproveBookingController);

	// Work Schedule Management
	router.post('/cua-hang-truong/lich-lam-viec/tao-moi', workScheduleApiController.handleCreateWorkScheduleForStoreManagerApiController);

	// Statistics
	router.get('/cua-hang-truong/:storeManagerId/thong-ke/so-lieu/tong-quat', statisticApiController.getBookingSummary);
	router.get('/cua-hang-truong/:storeManagerId/thong-ke/danh-sach/lich-hen', statisticApiController.getBookingList);
	router.get('/cua-hang-truong/:storeManagerId/thong-ke/bieu-do/duong', statisticApiController.getBookingsTrendData);


	// =========================
	// TÀI KHOẢN
	// =========================
	router.get('/user/read/:email', accountApiController.readUser);

	return app.use("/api/", router);
};

export default initApiRoutes;