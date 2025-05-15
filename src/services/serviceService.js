import { or } from 'sequelize/lib/sequelize';
import db from '../models/index.js'
import formatUtil from '../utils/formatUtil.js'
import notificationApiService from './notificationApiService.js';
import { raw } from 'body-parser';
// --------------------------------------------------
const getPendingServiceList = async () => {
    try {
        // Lấy tất cả các dịch vụ
        const doctorservice = await db.DoctorService.findAll({
            include: [
                { model: db.Service },
                { model: db.Doctors, include: [{ model: db.User }] }
            ],
            order: [['startDate', 'DESC']],
            raw: true
        });

        // Phân chia danh sách theo trạng thái
        let totalRevenue = doctorservice
            .filter(item => item.status !== 'pending')
            .reduce((sum, item) => sum + parseFloat(item["Service.price"] || 0), 0);
        totalRevenue = formatUtil.formatCurrency(totalRevenue);

        // Tính số lượng gói trung bình (serviceId = 2) và gói cao cấp (serviceId = 3)
        const totalAveragePackages = doctorservice.filter(item => item.serviceId === 2).length;
        const totalPremiumPackages = doctorservice.filter(item => item.serviceId === 3).length;

        const pendingServices = [];
        const activeAndexpiredServices = [];
        const totalServices = doctorservice.length;

        doctorservice.forEach(item => {
            const formattedItem = {
                id: item.id,
                doctorId: item.doctorId,
                serviceId: item.serviceId,
                name: item["Service.name"],
                userName: item["Doctor.User.name"],
                startDate: formatUtil.formatDate(item.startDate),
                expiryDate: formatUtil.formatDate(item.expiryDate),
                status: item.status,
                price: formatUtil.formatCurrency(item["Service.price"]),
                avatar: item["Doctor.User.avatar"]
            };
            if (item.status === 'pending') {
                pendingServices.push(formattedItem);
            } else {
                activeAndexpiredServices.push(formattedItem);
            }
        });

        // Sắp xếp danh sách theo ngày bắt đầu (startDate) giảm dần

        return {
            EC: 0,
            EM: 'Lấy danh sách gói thành công',
            DT: { 
                activeAndexpiredServices,
                pendingServices,
                totalServices, 
                totalRevenue, 
                totalAveragePackages, 
                totalPremiumPackages 
            }
        };
    } catch (error) {
        console.error(error)
        return {
            EC: -1,
            EM: 'Lỗi server khi lấy danh sách gói chưa duyệt',
            DT: []
        }
    }
}

// --------------------------------------------------
const getDoctorServiceDetails = async (doctorServiceId) => {
    try {
        // Lấy tất cả các dịch vụ
        let doctorservice = await db.DoctorService.findOne({
            where: { id: doctorServiceId },
            include: [
                { model: db.Service },
                { model: db.Doctors, include: [{ model: db.User }] }
            ],
            raw: true
        });
    
        if (!doctorservice) {
            return null; // Hoặc throw error tùy yêu cầu
        }
    
        doctorservice = {
            id: doctorservice.id,
            doctorId: doctorservice.doctorId,
            serviceId: doctorservice.serviceId,
            name: doctorservice["Service.name"],
            userName: doctorservice["Doctor.User.name"],
            startDate: formatUtil.formatDate(doctorservice.startDate),
            expiryDate: formatUtil.formatDate(doctorservice.expiryDate),
            status: doctorservice.status,
            price: formatUtil.formatCurrency(doctorservice["Service.price"]),
            avatar: doctorservice["Doctor.User.avatar"]
        };

        return {
            EC: 0,
            EM: 'Lấy gói dịch vụ của bác sĩ thành công',
            DT: doctorservice
        };
    } catch (error) {
        console.error(error)
        return {
            EC: -1,
            EM: 'Lỗi server khi lấy gói dịch vụ của bác sĩ',
            DT: []
        }
    }
}

// --------------------------------------------------
const approveServices = async (doctorServiceId) => {
    try {
        const service = await db.DoctorService.findOne({
            where: { id: doctorServiceId },
            include: { model: db.Doctors },
            raw: true,
            nest: true
        });
        console.log("====================================================");
        console.log("service", service);

        if (!service) {
            return { EC: 1, EM: "Dịch vụ không tồn tại" };
        }

        if (service.status === 'active') {
            return { EC: 2, EM: "Dịch vụ đã được phê duyệt trước đó" };
        }

        // Cập nhật startDate & expiryDate
        const duration = 30; // Thời hạn gói (ví dụ: 30 ngày)
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + duration);
        
        const result = await db.DoctorService.update(
            { status: 'active', startDate: now, expiryDate: expiryDate },
            { where: { id: doctorServiceId } }
        );

        await notificationApiService.createNotification(service.Doctor.userId, `Đơn đăng ký dịch vụ của bạn đã được duyệt`, `/doctor/service-management` );

        if (result[0] > 0) {
            return { EC: 0, EM: "Duyệt dịch vụ thành công" };
        } else {
            return { EC: -1, EM: "Không có dịch vụ nào được duyệt" };
        }
    } catch (error) {
        console.error(error);
        return {
            EC: -1,
            EM: 'Lỗi khi duyệt dịch vụ'
        };
    }
}

// --------------------------------------------------
const terminateService = async (doctorServiceId) => {
    try {
        const service = await db.DoctorService.findOne({
            where: { id: doctorServiceId },
            include: { model: db.Doctors },
            raw: true,
            nest: true
        });
        console.log("====================================================");
        console.log("service", service);

        if (!service) {
            return { EC: 1, EM: "Service does not exist", DT: null };
        }

        if (service.status === 'terminated') {
            return { EC: 0, EM: "Dịch vụ này đã bị chấm dứt", DT: null };
        }

        const result = await db.DoctorService.update(
            { status: 'terminated' },
            { where: { id: doctorServiceId } }
        );

        await notificationApiService.createNotification(service.Doctor.userId, `Đơn đăng ký dịch vụ của bạn đã bị chấm dứt trước hạn`, `/doctor/service-management` );

        if (result[0] > 0) {
            return { EC: 0, EM: "Service terminated successfully", DT: null };
        } else {
            return { EC: -1, EM: "No service was terminated", DT: null };
        }
    } catch (error) {
        console.error(error);
        return {
            EC: -1,
            EM: 'Error terminating service',
            DT: null
        };
    }
}

// --------------------------------------------------
export default { 
    getPendingServiceList, 
    getDoctorServiceDetails,
    approveServices,
    terminateService
};
