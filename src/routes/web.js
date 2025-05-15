import express from "express";
import multer from "multer";
import path from "path";

import homeController from "../controllers/homeController";
import AuthAdminController from "../controllers/AuthAdminController";
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController';
import facilityController from '../controllers/facilityController';
import bookingController from '../controllers/bookingController';
import userController from '../controllers/userController';
import historyController from '../controllers/historyController';
import scheduleController from '../controllers/scheduleController';
import pendingDoctorsController from '../controllers/pendingDoctorsController';
import medicineController from '../controllers/medicineController';
import serviceController from '../controllers/serviceController';
import syncData from '../utils/syncData';
import getAllDataFromElasticSearch from '../utils/getAllDataFromElasticSearch';

import validateInput from "../middleware/validateInput";
import authMiddleware from "../middleware/authMiddleware"
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
    // Dashboard
    router.get('/search', authMiddleware, homeController.renderSearchResultsPage);
    router.get('/dashboard', authMiddleware, homeController.getHomePage);

    // Admin routes
    router.get('/admin-login', AuthAdminController.getAdminLoginPage)
    router.post('/admin-login/login', AuthAdminController.handleAdminLogin)
    router.post('/admin-logout', AuthAdminController.handleAdminLogout)

    // User routes
    router.get('/user', authMiddleware, homeController.getUserPage);
    router.get('/update-user/:id', authMiddleware, homeController.getUpdateUserPage);
    router.post('/users/update-user', authMiddleware, homeController.postUpdateUser);
    router.post('/delete-user/:id', authMiddleware, homeController.handleDeleteNewUser);

    // Bác sĩ
    // router.get('/doctor', homeController.getManagerDoctorPage);
    router.post('/doctor/create-doctor', authMiddleware, homeController.handleCreateNewDoctor);
    router.get('/doctor/update/:id', authMiddleware, homeController.getUpdateDoctorPage);
    router.put('/doctor/update/:id', authMiddleware, homeController.handleUpdateDoctor);
    router.delete('/doctor/delete/:id', authMiddleware, homeController.handleDeleteDoctor);

    // Người dùng
    router.get('/user-detail/:id', authMiddleware, userController.getUserDetailPage)
    router.post('/lock-account', authMiddleware, userController.lockAccount)
    router.post('/unlock-account', authMiddleware, userController.unlockAccount)
    
    // Bác sĩ
    router.get('/manager-doctor', authMiddleware, doctorController.renderManagerDoctorPage)
    router.get('/doctor-detail/:id', authMiddleware, doctorController.renderDoctorDetailPage)
    
    // Bệnh nhân
    router.get('/patient-list', authMiddleware, patientController.renderPatientsPage)
    router.get('/patient-detail/:id', authMiddleware, patientController.renderPatientDetailPage)
    
    // Chuyên khoa
    router.get('/specialty-list', authMiddleware, specialtyController.renderSpecialtiesPage);
    router.get('/specialty-detail/:id', authMiddleware, specialtyController.renderSpecialtyDetailPage)
    router.get('/specialty/deleted-specialty-list', authMiddleware, specialtyController.renderDeletedSpecialtyListPage)
    router.post('/specialty/update', authMiddleware, upload.single("specialtyImage"), validateInput.validateSpecialtyData, specialtyController.updateSpecialty)
    router.post('/specialty/create', authMiddleware, upload.single("specialtyImage"), validateInput.validateSpecialtyData, specialtyController.createSpecialty)
    router.delete('/specialty/delete', authMiddleware, specialtyController.deleteSpecialty)
    router.delete('/specialty/deleteAll', authMiddleware, specialtyController.deleteAllDeletedSpecialties)
    router.post('/specialty/restore', authMiddleware, specialtyController.restoreSpecialty)
    router.post('/specialty/them-bac-si', authMiddleware, specialtyController.addDoctorsToSpecialty)
    router.post('/specialty/change-doctor-specialty', authMiddleware, doctorController.switchTheDoctorSpecialty)
    
    // Đơn thuốc
    router.get('/medicine/manager-medicine', authMiddleware, medicineController.renderManagerMedicinePage)

    // Cơ sở y tế
    router.get('/facility-list', authMiddleware, facilityController.renderFacilitiesPage);
    router.get('/facility-detail/:id', authMiddleware, facilityController.renderFacilityDetailPage);
    router.post(
        '/facility/create',
        authMiddleware, // phải đưa ra ngoài, không lồng trong hàm
        upload.fields([
            { name: 'mainImage', maxCount: 1 },
            { name: 'subImages', maxCount: 20 } // sửa lại tên field
        ]),
        facilityController.createFacility
    );
    router.post('/facility/change-doctor-facility', authMiddleware, doctorController.switchTheDoctorWorkFacility);

    // Đặt chỗ
    router.get('/booking-list', authMiddleware, bookingController.renderManagerBookingPage);
    router.get('/booking-detail/:id', authMiddleware, bookingController.renderBookingDetailPage);
    router.post('/booking-detail/duyet', authMiddleware, bookingController.approveBooking);
    router.post('/booking-detail/huy', authMiddleware, bookingController.rejectBooking);

    // Lịch làm việc
    router.get('/manager-schedule', authMiddleware, scheduleController.renderSchedulePage)
    router.post('/schedule/create', authMiddleware, scheduleController.createSchedule)

    // lịch sử khám
    router.get('/medical-history-list', authMiddleware, historyController.getMedicalHistoryPage)
    router.get('/site-intro', authMiddleware, homeController.getSiteintroPage);

    // Phê duyệt
    router.get('/pending-doctors', authMiddleware, pendingDoctorsController.renderPendingDoctorsPage)
    router.post('/pending-doctors/pending', authMiddleware, pendingDoctorsController.handlePendingDoctors)

    // Kiểm duyệt gói dịch vụ
    router.get('/doctor-service/pending-list', authMiddleware, serviceController.renderPendingServicesPage)
    router.get('/doctor-service/detail', authMiddleware, serviceController.renderEditDoctorServicePage)
    router.post('/doctor-service/approve', authMiddleware, serviceController.approveServices)
    router.post('/doctor-service/terminate', authMiddleware, serviceController.terminateService)

    // XEM BIẾN MÀU CỦA HỆ THỐNG
    router.get('/color', authMiddleware, (req, res) => {
        return res.render('layouts/layout', {
            page: `pages/colorPage.ejs`,
            pageTitle: 'Màu hệ thống',
            data: null,
            message: null,
            EC: null
        });
    });
    
    // Đồng bộ dữ liệu với elasticsearch ---------------------------------------------------------
    router.post('/sync-doctors-data', authMiddleware, async (req, res) => {
        try {
            await syncData.syncDoctorsData();
            res.status(200).json({ message: 'Data synced successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to sync data' });
        }
    });
    router.post('/sync-specialties-data', authMiddleware, async (req, res) => {
        try {
            await syncData.syncSpecialtiesData();
            res.status(200).json({ message: 'Data synced successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to sync data' });
        }
    });
    router.post('/sync-facilities-data', authMiddleware, async (req, res) => {
        try {
            await syncData.syncFacilitiesData();
            res.status(200).json({ message: 'Data synced successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to sync data' });
        }
    });
    router.post('/sync-patients-data', authMiddleware, async (req, res) => {
        try {
            await syncData.deletePatientsIndex()
            await syncData.initializePatientsMapping();
            await syncData.syncPatientsData();
            res.status(200).json({ message: 'Data synced successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to sync data', message: error.message });
        }
    });

    // Lấy liệu với elasticsearch ----------------------------------------------------------------
    router.get('/getAllDoctorsDataOfElasticSearch', authMiddleware, async (req, res) => {
        try {
            const result= await getAllDataFromElasticSearch.getAllDoctorsData();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
        }
    });
    router.get('/getAllPatientsDataOfElasticSearch', authMiddleware, async (req, res) => {
        try {
            const result= await getAllDataFromElasticSearch.getAllPatientsData();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
        }
    });
    router.get('/getAllSpecialtiesDataOfElasticSearch', authMiddleware, async (req, res) => {
		try {
            const result = await getAllDataFromElasticSearch.getAllSpecialtiesData();
            res.status(200).json(result);
		} catch (error) {
            res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
		}
    });

    router.get('/getAllFacilitiesDataOfElasticSearch', authMiddleware, async (req, res) => {
        try {
            const result = await getAllDataFromElasticSearch.getAllFacilitiesData();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Lấy dữ liệu thất bại' });
        }
    });

    router.get(/^\/(?!api).*$/, authMiddleware, homeController.render404Page);

    return app.use("/", router)
}
export default initWebRoutes;