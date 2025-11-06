import express from "express";
import multer from "multer";
import path from "path";

import loginApiController from "../controllers/API/loginApiController";
import forgotPasswordApiController from "../controllers/API/forgotPasswordApiController";
import registerApiController from "../controllers/API/registerApiController";
import accountApiController from "../controllers/API/accountApiController";
import technicianApiController from "../controllers/API/technicianApiController";
import transferRequestApiController from "../controllers/API/transferRequestApiController";
import specialtyApiController from "../controllers/API/specialtyApiController";
import storeApiController from "../controllers/API/storeApiController";
import workScheduleApiController from "../controllers/API/workScheduleApiController";
import ratingApiController from "../controllers/API/ratingApiController";
import bookingApiController from "../controllers/API/bookingApiController";
import technicianBookingApiController from "../controllers/API/technicianBookingApiController";
import statisticApiController from "../controllers/API/statisticApiController";
import notificationApiiController from "../controllers/API/notificationApiController";

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
	router.get('/notifications/:userId', notificationApiiController.readUserNotifications);
	router.get('/thong-bao/nguoi-dung/:userId/danh-dau-da-doc', notificationApiiController.markAsReadNotifications);

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
	router.get('/ky-thuat-vien/:id/thong-tin/danh-gia', ratingApiController.readTechnicianRatings);
	router.get('/ky-thuat-vien/:technicianId/thong-tin/ky-thuat-vien-tuong-tu', technicianApiController.readSimilarTechniciansApiController);

	// Rating
	router.get('/danh-gia/:reviewId', ratingApiController.readRating);
	router.post('/danh-gia/tao-moi', upload.array("images", 10), ratingApiController.handleCraeteNewRating);

	// =========================
	// KỸ THUẬT VIÊN
	// =========================
	router.post('/sign-in-email/technician', loginApiController.signInByEmailForTechnician);
	router.post('/sign-in-phone/technician', loginApiController.signInByPhoneForTechnician);

	// Booking
	router.get('/ky-thuat-vien/:technicianId/don-dat-lich/danh-sach', technicianBookingApiController.getBookingListByTechnician);
	router.get('/laydondatlich/:bookingId', technicianBookingApiController.getBookingDetailByTechnician);
	router.post('/don-dat-lich/xac-nhan-hoan-thanh-don', technicianBookingApiController.handleConfirmAndCompleteBooking);

	// WorkSchedule
	router.get('/ky-thuat-vien/:technicianId/lich-lam-viec/danh-sach', technicianBookingApiController.getWorkScheduleByTechnician);
	router.get('/chitietlichlamviec/:scheduleId', technicianBookingApiController.getTechnicianWorkScheduleDetail);

	// Profile
	router.get('/hoso/:technicianId', technicianBookingApiController.getTechnicianProfile);

	// Rating
	router.get('/danh-gia/ky-thuat-vien/:technicianId', technicianBookingApiController.getTechnicianRatings);

	// =========================
	// CỬA HÀNG TRƯỞNG
	// =========================
	// Login
	router.post('/sign-in-email/store-manager', loginApiController.signInByEmailForStoreManager);
	router.post('/sign-in-phone/store-manager', loginApiController.signInByPhoneForStoreManager);

	// Technician Management
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/lich-lam-viec', technicianApiController.readTechnicianSchedulesForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/con-trong', technicianApiController.readAvailableTechniciansForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/doi-lich', technicianApiController.readAvailableTechniciansForStoreManagerApiController);
	router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/danh-sach', technicianApiController.readAllTechniciansForStoreManagerApiController);
	router.post('/cua-hang-truong/:storeManagerId/ky-thuat-vien/tao-moi', upload.single('avatar'), technicianApiController.handleCreateTechnicianForStoreManagerApiController);
	router.put('/cua-hang-truong/:storeManagerId/ky-thuat-vien/:technicianId/cap-nhat/thong-tin-co-ban', technicianApiController.handleUpdateTechnicianBasicInfoForStoreManager);
	router.put('/cua-hang-truong/:storeManagerId/ky-thuat-vien/:technicianId/cap-nhat/thong-tin-chuyen-mon', technicianApiController.handleUpdateTechnicianSpecialtiesForStoreManager);
	
	// Transfer Request 
	router.get('/cua-hang-truong/:storeManagerId/yeu-cau/danh-sach', transferRequestApiController.readTransferRequestsByStoreManager);
	router.post('/cua-hang-truong/:storeManagerId/ky-thuat-vien/:technicianId/yeu-cau/doi-cua-hang', technicianApiController.handleTechnicianTransferRequestByStoreManager);

	// Booking Management
	router.get('/cua-hang-truong/:storeManagerId/don-dat-lich/danh-sach', bookingApiController.readAllBookingForStoreManagerApiController);
	router.get('/cua-hang-truong/don-dat-lich/:repair_booking_id/chi-tiet', bookingApiController.fuckYouApiController);
	router.put('/cua-hang-truong/don-dat-lich/duyet-don', bookingApiController.approveRepairBookingController);
	router.put('/cua-hang-truong/don-dat-lich/doi-nguoi-sua-chua', bookingApiController.reassignAndApproveBookingController);

	// Work Schedule Management
	router.post('/cua-hang-truong/lich-lam-viec/tao-moi', workScheduleApiController.handleCreateWorkScheduleForStoreManagerApiController);

	// Rating
	router.get('/cua-hang-truong/:storeManagerId/danh-gia/danh-sach', ratingApiController.readRatingsForStoreManager);

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