import express from "express";
import multer from "multer";
import path from "path";

import jwtActions from '../middleware/JWTAction';
import authenticateToken from "../middleware/authMiddleware";

import loginApiController from "../controllers/API/loginApiController";
import forgotPasswordApiController from "../controllers/API/forgotPasswordApiController";
import registerApiController from '../controllers/API/registerApiController';
import accountApiController from "../controllers/API/accountApiController";
import userApiController from '../controllers/API/userApiController';
import technicianApiController from "../controllers/API/technicianApiController";
import specialtyApiController from "../controllers/API/specialtyApiController";
import workScheduleApiController from "../controllers/API/workScheduleApiController";
import ratingApiController from '../controllers/API/ratingApiController';

// import technicianApiController from '../controllers/API/technicianApiController';
// import doctorPaymentsApiController from '../controllers/API/doctorPaymentsApiController';
import bookingApiController from '../controllers/API/bookingApiController';
// import scheduleApiController from '../controllers/API/scheduleApiController';
// import medicineApiController from "../controllers/API/medicineApiController";

// import statsApiController from "../controllers/API/statsApiController";
// import serviceApiController from "../controllers/API/serviceApiController"
// import specialtyApiController from '../controllers/API/specialtyApiController';
// import facilityApiController from '../controllers/API/facilityApiController';
// import notificationApiController from "../controllers/API/notificationApiController";

// import searchApiController from '../controllers/API/searchApiController';

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
    // Kỹ thuật viên
    router.get('/ky-thuat-vien/danh-sach', technicianApiController.readTechnicians);
    router.get('/ky-thuat-vien/:id/thong-tin/chi-tiet', technicianApiController.readTechnicianDetail);
    router.get('/ky-thuat-vien/:id/thong-tin/lich-lam-viec', workScheduleApiController.readWorkScheduleByTechnician );
    router.get('/ky-thuat-vien/:id/thong-tin/danh-gia', ratingApiController.readTechnicianRatingsApiController );
    router.get('/ky-thuat-vien/:technicianId/thong-tin/ky-thuat-vien-tuong-tu', technicianApiController.readSimilarTechniciansApiController );
    
    // Chuyên môn
    router.get('/chuyen-mon/danh-sach', specialtyApiController.readSpecialties);

    // Đặt Lịch
    router.get('/dat-lich/tao-lich-moi/:workScheduleId/:userId/lay-du-lieu/', bookingApiController.readDataForCreateBookingApiController);
    router.post('/dat-lich/tao-lich-hen-moi/them-moi', upload.single('issueImage'), bookingApiController.createBookingApiController);
    router.post('/dat-lich/:bookingId/huy-lich', bookingApiController.cancelBookingApiController);
    router.post('/dat-lich/:bookingId/cap-nhat', upload.single("issueImage"), bookingApiController.updateBookingApiController);

    // Lấy chi tiết lịch hẹn theo bookingId
    router.get('/dat-lich/khach-hang/:userId/danh-sach', bookingApiController.readCustomerBookingsApiController);
    router.get('/dat-lich/:bookingId/thong-tin/chi-tiet', bookingApiController.readBookingByIdApiController);


    // // Tài khoản  ---------------------------------------------------------
    // router.post('/register-doctor', upload.single("avatar"), registerApiController.handleRegisterDoctor)
    // router.post('/register/check-email', registerApiController.handleCheckEmail)
    // router.post('/register-patient', registerApiController.handleRegisterPatient)
    // router.post('/login', loginApiController.handleLogin)
    // router.post('/forgot-password', /*authenticateToken,*/ forgotPasswordApiController.handleForgotPassword)
    // router.post('/verify-otp', /*authenticateToken,*/ forgotPasswordApiController.handleVerifyOTP)
    // router.post('/check-password', /*authenticateToken,*/ accountApiController.handleChangePassword)
    // router.post('/reset-password', /*authenticateToken,*/ accountApiController.handleResetPassword)
    
    // // router.get('/account', jwtActions.checkUserJWT, userApiController.getUserAccount)

    // // người dùng ---------------------------------------------------------
    // router.get('/user/read/:email',  accountApiController.readUser)
    // // router.get('/user/update/:email',  accountApiController.readUser)

    // router.get('/notifications/user/:userId', notificationApiController.readUserNotifications) 
    // router.get('/notifications/markAsRead/:notificationId', notificationApiController.markAsReadNotifications) 
    // router.get('/user/read', jwtActions.checkUserJWT, userApiController.readUser)
    // router.post('/user/create', userApiController.createUser)
    // router.put('/user/update', upload.single("avatar"), userApiController.updateUser)
    // router.delete('/user/delete', userApiController.deleteUser)

    //     // Hệ thống Bác sĩ ---------------------------------------------------------
    //     router.get('/doctor/read', doctorApiController.readDoctors);
    //     router.get('/doctor/read/:id', doctorApiController.readDoctorDetail);
    //     router.put('/doctor/update', doctorApiController.updateDoctor);
    //     router.get('/doctor/featured/read', doctorApiController.readFeaturedDoctors);

    //     // Lịch sử khám bệnh của bệnh nhân với bác sĩ
    //     router.get('/doctor/visited/:patientId', doctorApiController.readVisitedDoctors);

    //     // Tìm kiếm bác sĩ theo chuyên khoa
    //     router.get('/doctor/specialty/', doctorApiController.readDoctorsBySpecialty);

    //     // Quản lý đặt lịch của bác sĩ
    //     router.get('/doctor/manager-booking/bookings-today/read/:userId', bookingApiController.readBookingsTodayOfDoctorByDoctorId);
    //     router.post('/doctor/manager-booking/complete-booking/update', bookingApiController.createCompleteBooking);
    //     router.get('/doctor/manager-booking/booking-history/read/:doctorId', bookingApiController.readBookingHistoryOfDoctor);

    //     // Quản lý thống kê của bác sĩ
    //     router.get('/doctor/statistics/bookings/read/:doctorId', statsApiController.readDoctorBookingStats);
    //     router.get('/doctor/statistics/patients/read/:doctorId', statsApiController.readDoctorPatientStats);
    //     router.get('/doctor/statistics/revenues/read/:doctorId', statsApiController.readDoctorRevenueStats);

    //     // Quản lý lịch làm việc của bác sĩ
    //     router.get('/doctor/manager-schedule/read/:userId', scheduleApiController.readSchedulesOfDoctor);

    //     // Quản lý bệnh nhân của bác sĩ
    //     router.get('/doctor/manager-patient/read/:doctorId', doctorApiController.readPatientsOfDoctor);

    //     // Thanh toán của bác sĩ
    //     router.get('/doctor/payment/read/:doctorId', doctorPaymentsApiController.readPaymentByDoctorId);
    //     router.get('/doctor/payment/detail/read/:paymentId', doctorPaymentsApiController.readDetailPaymentByPaymentId);

    //     // Đơn thuốc
    //     router.get('/doctor/medicine/read', medicineApiController.readMedicines);

    //     // Tìm kiếm bệnh nhân ------------------------------------------------------------
    //     router.get('/search-patient/:doctorId', searchApiController.searchPatients);
    
    //     // người dùng ---------------------------------------------------------
    // router.get('/specialties/read', specialtyApiController.readSpecialties)
    // router.get('/specialties/read/:id', specialtyApiController.readSpecialtyDetail)

    // // Cơ sở y tế ---------------------------------------------------------
    // router.get('/facilities/read', facilityApiController.readFacilities)
    // router.get('/facilities/read/:id', facilityApiController.readFacilityDetail)

    // // đặt lịch ---------------------------------------------------------
    // router.get('/booking/confirm/', bookingApiController.getBookingDetails);
    // router.get('/booking/upcomingbooking/read/:patientId', bookingApiController.readUpcomingBookings)
    // router.get('/booking/historybooking/read/:userId', bookingApiController.readHistoryBookingsOfPatient)
    // router.get('/booking/read/:bookingId', bookingApiController.handleReadBookingDetail);
    // router.get('/booking/history/read/:bookingId', bookingApiController.readHistoryBookingDetailOfPatient);
    // router.post('/booking/create', bookingApiController.processCreateBooking)
    // router.post('/booking/cancel', bookingApiController.handleCancelBookingById)

    // // lịch hẹn của bác sĩ ---------------------------------------------------------
    // router.get('/schedule/read/:id', scheduleApiController.readSchedule); // Dùng cho xác nhận đặt lịch
    // router.get('/schedule-timeslot/read/:userId', scheduleApiController.readSchedulesAndTimeSlotOfDoctor); // Dùng cho lấy dữ liệu để thêm lịch làm việc
    // router.get('/schedules/available-timeslots', scheduleApiController.readTimeslotsNotInScheduleByScheduleId); // Dùng cho khung giờ còn trống làm việc có thể CẬP NHẬT
    
    // router.post('/schedule/create', scheduleApiController.createSchedules);
    // router.put(`/update-schedule`, scheduleApiController.updateSchedule);

    // Đánh giá bác sĩ ---------------------------------------------------------
    // router.post('/rating/create', ratingApiController.createRating);
    router.post('/sign-up', registerApiController.handleSignUpNewUser);
    router.post('/sign-in-email', loginApiController.signInByEmail);
    router.post('/sign-in-phone', loginApiController.signInByPhone);
    // router.post('/booking/create', ratingApiController.createBooking);
    // router.post('/booking/confirm', ratingApiController.createBooking);

    // // Tìm kiếm Bác sĩ, Chuyên khoa ---------------------------------------------------------
    // router.get('/search', searchApiController.search);

    // // Tìm kiếm Bác sĩ, Chuyên khoa, Phòng khám ---------------------------------------------------------
    // router.get('/search-all', searchApiController.searchAll);



    // router.get('/services/all', serviceApiController.readAllServices);
    // router.get('/doctor/service/read/:doctorId', serviceApiController.readDoctorServices);
    // router.post('/doctor/service/register', serviceApiController.registerDoctorService);
    // router.put('/doctor/service/update', serviceApiController.updateDoctorService);

    return app.use("/api/", router)
}
export default initApiRoutes;