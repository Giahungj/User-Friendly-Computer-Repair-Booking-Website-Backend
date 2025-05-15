import db from "../models";
import cron from 'node-cron';
import { Op } from "sequelize";
import formatUtil from "../utils/formatUtil"
import notificationService from "../services/notificationApiService";
import { where } from "sequelize/lib/sequelize";
// ---------------------------------------------------------
// Lên lịch chạy mỗi ngày lúc 0:00
const updateDoctorServiceStatus = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Bắt đầu kiểm tra trạng thái gói dịch vụ...');
      const now = new Date();

      // Tìm các gói dịch vụ active nhưng đã hết hạn
      const expiredServices = await db.DoctorService.findAll({
        where: {
          status: 'active',
          expirationDate: { [Op.lt]: now } // expirationDate < now
        }
      });

      if (expiredServices.length === 0) {
        console.log('Không có gói dịch vụ nào hết hạn.');
        return;
      }

      // Cập nhật trạng thái thành 'expired'
      await db.DoctorService.update(
        { status: 'expired' },
        {
          where: {
            id: { [Op.in]: expiredServices.map(service => service.id) }
          }
        }
      );

      console.log(`Đã cập nhật ${expiredServices.length} gói dịch vụ thành hết hạn.`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái gói dịch vụ:', error);
    }
  });
};

// ---------------------------------------------------------
const getAllServicesService = async () => {
    try {
        let services = await db.Service.findAll({
            raw: true,
            nest: true,
        });

        const formattedServices = services.map(service => ({
            ...service,
            price: formatUtil.formatCurrency(service.price) // Giả sử formatMoney là hàm định dạng tiền tệ
        }));

        return {
            EM: "Lấy danh sách dịch vụ thành công!",
            EC: 0,
            DT: formattedServices
        };
    } catch (error) {
        console.error("Lỗi lấy danh sách dịch vụ:", error);
        return {
            EM: "Đã có lỗi xảy ra khi lấy danh sách dịch vụ.",
            EC: -1,
            DT: []
        };
    }
};

// ---------------------------------------------------------
const createDoctorService = async (doctorId, serviceId) => {
    try {
        // Kiểm tra bác sĩ và dịch vụ có tồn tại không
        const doctor = await db.Doctors.findByPk(doctorId);
        const service = await db.Service.findByPk(serviceId);

        if (!doctor) return { EC: 1, EM: "Bác sĩ không tồn tại" };
        if (!service) return { EC: 2, EM: "Dịch vụ không tồn tại" };

        // Kiểm tra xem bác sĩ đã đăng ký dịch vụ này chưa
        const existingService = await db.DoctorService.findOne({
            where: {
                doctorId,
                status: ['pending', 'active']    // chỉ cần doctorId & trạng thái
            }
        });
        
        if (existingService) {
            return { EC: 1, EM: "Bác sĩ đã có dịch vụ đang được kích hoạt/đợi duyệt"};
        }

        // Đặt startDate và expiryDate khi đăng ký (chưa duyệt)
        const duration = 1; // Số ngày hiệu lực
        const startDate = new Date(); // Ngày giờ hiện tại
        const expiryDate = new Date(); // Sao chép giá trị của startDate

       const newService = await db.DoctorService.create({
           doctorId, 
           serviceId, 
           startDate: startDate, 
           expiryDate: expiryDate, 
           status: 'pending'
       });
       await notificationService.createNotification(doctor.userId, `Bạn đã đăng ký dịch vụ ${service.name} thành công. Vui lòng chờ duyệt.`, '/doctor/service-management');
       return { EC: 0, EM: "Đăng ký dịch vụ thành công!", DT: newService };
    } catch (error) {
        console.error("Lỗi tạo DoctorService:", error);
        return { EC: -1, EM: "Lỗi khi tạo dịch vụ bác sĩ", DT: null };
    }
};

// ---------------------------------------------------------
const upgradeDoctorService = async (doctorId, newServiceId) => {
    try {
        if (!doctorId || !newServiceId) {
            return { EM: "Thiếu thông tin: doctorId hoặc newServiceId.", EC: -1, DT: null };
        }

        // Kiểm tra xem bác sĩ đã có gói này chưa
        const existingService = await db.DoctorService.findOne({
            where: { doctorId, serviceId: newServiceId, status: ['pending', 'active'] } // Chỉ cần trạng thái pending hoặc active
        });

        if (existingService) {
            return { EM: "Bạn đã đăng ký gói dịch vụ này rồi.", EC: -2, DT: null };
        }

        // Lấy gói hiện tại của bác sĩ (nếu có)
        const currentService = await db.DoctorService.findOne({
            where: { doctorId }
        });

        // Kiểm tra nếu có gói hiện tại và chưa hết hạn
        if (currentService) {
            const expiryDate = new Date(currentService.expiryDate);
            const today = new Date();
            
            if (expiryDate > today) {
                return {
                    EM: "Gói hiện tại chưa hết hạn, không thể đăng ký gói mới.",
                    EC: -4,
                    DT: null
                };
            }
        }

        // Lấy thông tin gói mới
        const newService = await db.Service.findOne({ where: { id: newServiceId } });
        if (!newService) {
            return { EM: "Không tìm thấy thông tin gói dịch vụ mới.", EC: -3, DT: null };
        }

        const today = new Date();
        let newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + (newService.duration || 1)); // Thêm số tháng của gói mới

        // Nếu có gói cũ, cộng thêm một phần thời gian còn lại
        if (currentService) {
            const expiryDate = new Date(currentService.expiryDate);
            const daysRemaining = Math.max(Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)), 0);
            const bonusDays = Math.floor(daysRemaining * 0.5); // Cộng 50% số ngày còn lại
            newExpiryDate.setDate(newExpiryDate.getDate() + bonusDays);
        }

        // Thêm gói mới cho bác sĩ
        const newDoctorService = await db.DoctorService.create({
            doctorId,
            serviceId: newServiceId,
            startDate: today,
            expiryDate: newExpiryDate,
        });

        return {
            EM: `Đăng ký gói ${newServiceId} thành công. Hết hạn vào ${newExpiryDate.toISOString().split("T")[0]}.`,
            EC: 0,
            DT: newDoctorService
        };
    } catch (error) {
        console.error("Lỗi khi nâng cấp gói dịch vụ:", error);
        return { EM: "Đã có lỗi xảy ra khi nâng cấp gói dịch vụ.", EC: -1, DT: null };
    }
};

// ---------------------------------------------------------
const getDoctorServices = async (doctorId) => {
    try {
        const doctorServices = await db.DoctorService.findAll({
            where: { doctorId },
            include: [{ model: db.Service }],
            order: [['startDate', 'DESC']]
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const appointmentCount = await db.Schedule.count({
            where: {
                doctorId: doctorId,
                date: { [Op.between]: [startOfMonth, endOfMonth] }
            }
        });
        console.log(`Tổng số lịch hẹn trong tháng: ${appointmentCount}`);

        const formattedServices = doctorServices.map(service => {
            const expiryDate = new Date(service.expiryDate);   // ISO string/number ok?
            const today       = new Date();                    // NOW
            const timeDiff    = expiryDate - today;            // ms
            const daysRemaining = Math.max(
                Math.ceil(timeDiff / (1000 * 60 * 60 * 24)),
                0
            );
        
            // Định dạng ngày theo DD/MM/YYYY
            const formattedExpiryDate = formatUtil.formatDate(expiryDate);
            const formattedStartDate = formatUtil.formatDate(service.startDate);
        
            let status;
            if (service.status === 'active') {
                status = 'Đang kích hoạt';
            } else if (service.status === 'pending') {
                status = 'Chờ duyệt ...';
            } else if (service.status === 'expired') {
                status = 'Hết hạn';
            } else if (service.status === 'terminated') {
                status = 'Bị chấm dứt';
            } else {
                status = 'Không xác định';
            }
            
            return {
                ...service.toJSON(),
                expiryDate: formattedExpiryDate,
                startDate: formattedStartDate,
                daysRemaining,
                status,
                appointmentCount
            };
        });

        return { EC: 0, EM: "Lấy danh sách dịch vụ thành công", DT: formattedServices  };
    } catch (error) {
        console.error("Lỗi lấy danh sách DoctorService:", error);
        return { EC: -1, EM: "Lỗi khi lấy dịch vụ bác sĩ", DT: null };
    }
};

// ---------------------------------------------------------
export default {
    getAllServicesService,
    createDoctorService,
    upgradeDoctorService,
    getDoctorServices,

    updateDoctorServiceStatus
};
