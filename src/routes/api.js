import express from "express";
import multer from "multer";
import path from "path";

import loginApiController from "../controllers/API/loginApiController";
import forgotPasswordApiController from "../controllers/API/forgotPasswordApiController";
import registerApiController from "../controllers/API/registerApiController";
import accountApiController from "../controllers/API/accountApiController";
import technicianApiController from "../controllers/API/technicianApiController";
import specialtyApiController from "../controllers/API/specialtyApiController";
import workScheduleApiController from "../controllers/API/workScheduleApiController";
import ratingApiController from "../controllers/API/ratingApiController";
import bookingApiController from "../controllers/API/bookingApiController";

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

const initApiRoutes = (app) => {
    // ============================
    // HỆ THỐNG DÀNH CHO KHÁCH HÀNG
    // ============================
    router.post('/sign-up', registerApiController.handleSignUpNewUser);
    router.post('/sign-in-email', loginApiController.signInByEmail);
    router.post('/sign-in-phone', loginApiController.signInByPhone);

    // Đặt lịch
    router.get('/dat-lich/tao-lich-moi/:workScheduleId/:userId/lay-du-lieu/', bookingApiController.readDataForCreateBookingApiController);
    router.post('/dat-lich/tao-lich-hen-moi/them-moi', upload.single('issueImage'), bookingApiController.createBookingApiController);
    router.post('/dat-lich/:bookingId/huy-lich', bookingApiController.cancelBookingApiController);
    router.post('/dat-lich/:bookingId/cap-nhat', upload.single("issueImage"), bookingApiController.updateBookingApiController);
    router.get('/dat-lich/khach-hang/:userId/danh-sach', bookingApiController.readCustomerBookingsApiController);
    router.get('/dat-lich/:bookingId/thong-tin/chi-tiet', bookingApiController.readBookingByIdApiController);

    // Chuyên môn
    router.get('/chuyen-mon/danh-sach', specialtyApiController.readSpecialties);

    // Kỹ thuật viên
    router.get('/ky-thuat-vien/danh-sach', technicianApiController.readTechnicians);
    router.get('/ky-thuat-vien/:id/thong-tin/chi-tiet', technicianApiController.readTechnicianDetail);
    router.get('/ky-thuat-vien/:id/thong-tin/lich-lam-viec', workScheduleApiController.readWorkScheduleByTechnician);
    router.get('/ky-thuat-vien/:id/thong-tin/danh-gia', ratingApiController.readTechnicianRatingsApiController);
    router.get('/ky-thuat-vien/:technicianId/thong-tin/ky-thuat-vien-tuong-tu', technicianApiController.readSimilarTechniciansApiController);

    // ============================
    // HỆ THỐNG DÀNH CHO KỸ THUẬT VIÊN
    // ============================
    // TODO: Thêm các API liên quan đến kỹ thuật viên
    router.post('/sign-in-email/technician', loginApiController.signInByEmailForTechnician);
    router.post('/sign-in-phone/technician', loginApiController.signInByPhoneForTechnician);

    // ============================
    // HỆ THỐNG DÀNH CHO CỬA HÀNG TRƯỞNG
    // ============================
    // TODO: Thêm các API liên quan đến cửa hàng trưởng
    router.post('/sign-in-email/store-manager', loginApiController.signInByEmailForStoreManager);
    router.post('/sign-in-phone/store-manager', loginApiController.signInByPhoneForStoreManager);
    router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/lich-lam-viec', technicianApiController.readTechnicianSchedulesForStoreManagerApiController);
    router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/con-trong', technicianApiController.readAvailableTechniciansForStoreManagerApiController);
    router.get('/cua-hang-truong/:storeManagerId/ky-thuat-vien/danh-sach'   , technicianApiController.readAllTechniciansForStoreManagerApiController);
    router.get('/cua-hang-truong/:storeManagerId/don-dat-lich/danh-sach', bookingApiController.readAllBookingForStoreManagerApiController);
    router.get('/cua-hang-truong/don-dat-lich/:repair_booking_id/chi-tiet', bookingApiController.fuckYouApiController);
    router.put('/cua-hang-truong/don-dat-lich/duyet-don', bookingApiController.approveRepairBookingController);
    
    router.post('/cua-hang-truong/:storeManagerId/ky-thuat-vien/tao-moi', upload.single('avatar'), technicianApiController.handleCreateTechnicianForStoreManagerApiController);
    router.put('/cua-hang-truong/:storeManagerId/ky-thuat-vien/:technicianId/cap-nhat', technicianApiController.handleUpdateTechnicianForStoreManagerApiController);
    
    router.post('/cua-hang-truong/lich-lam-viec/tao-moi', workScheduleApiController.handleCreateWorkScheduleForStoreManagerApiController);
    return app.use("/api/", router);
};

export default initApiRoutes;