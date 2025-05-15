import { where } from "sequelize/lib/sequelize";
import db from "../models";
import { Op } from 'sequelize';
import syncData from '../utils/syncData';

// ---------------------------------------------------------
const getSchedules = async (id) => {
    const schedule = await db.Schedule.findOne({
        where: { id: id },
        include: [{ model: db.Timeslot }, {model: db.Doctors, include: [{model: db.User}]}],
        raw: true,
        nest: true
    });

    const bookings = await db.Booking.findAll({
        where: { scheduleId: id },
        include: [{ model: db.Patient, include: [{ model: db.User }] }],
        raw: true,
        nest: true
    });

    return { schedule, bookings };
};

// ---------------------------------------------------------
const getTimeslotsNotInScheduleByScheduleId = async (scheduleId, userId, date) => {
    try {
        const doctor = await db.Doctors.findOne({
            where: { userId: userId },
            raw: true, nest: true
        })
        const schedule = await db.Schedule.findOne({
            where: { id: scheduleId },
            include: [{ model: db.Timeslot }],
            raw: true, nest: true
        });

        const schedules = await db.Schedule.findAll({
            where: { date: date, doctorId: doctor.id },
            include: [{ model: db.Timeslot }],
            raw: true, nest: true
        });
        // Lấy tất cả timeSlotId từ schedules
        const usedTimeSlotIds = schedules.map(item => item.timeSlotId);
        
        // Lấy các timeslot không có id bằng timeslotId (nếu có)
        const timeslots = await db.Timeslot.findAll({
            where: { id: {[Op.notIn]: usedTimeSlotIds}},
            raw: true, nest: true
        });
        
        return { EC: 0, EM: "Lấy timeslot không tồn tại trong schedule thành công", DT: {timeslots, schedule} };
    } catch (error) {
        console.error("Lỗi khi lấy timeslot không tồn tại trong schedule 40:", error);
        return { EC: -1, EM: "Lỗi hệ thống", DT: null };
    }
};

// ---------------------------------------------------------
const getSchedulesOfDoctor = async (userId, date) => {
    try {
        const doctor = await db.Doctors.findOne({
            where: { userId: userId },
            raw: true,
            nest: true
        });

        if (!doctor) {
            return { EC: 1, EM: "Không tìm thấy bác sĩ", DT: null };
        }
        const whereCondition = { doctorId: doctor.id };
        if (date) whereCondition.date = date;
        const schedules = await db.Schedule.findAll({
            where: whereCondition,
            include: [{ model: db.Timeslot }],
            order: [['updatedAt', 'DESC']],
            raw: true,
            nest: true
        });
        return { EC: 0, EM: "Lấy lịch thành công", DT: schedules };
    } catch (error) {
        console.error("Lỗi khi lấy lịch bác sĩ:", error);
        return { EC: -1, EM: "Lỗi server", DT: null };
    }
};

// ---------------------------------------------------------
const getSchedulesAndTimeSlotOfDoctor = async (userId, date) => {
    try {
        const doctor = await db.Doctors.findOne({
            where: { userId: userId },
            raw: true,
            nest: true
        });

        if (!doctor) {
            return { EC: 1, EM: "Không tìm thấy bác sĩ", DT: null };
        }
        const whereCondition = { doctorId: doctor.id };
        if (date) whereCondition.date = date;
        const schedules = await db.Schedule.findAll({
            where: whereCondition,
            raw: true,
            nest: true
        });
        const timeslots = await db.Timeslot.findAll({
            raw: true,
            nest: true 
        })
        return { EC: 0, EM: "Lấy lịch thành công", DT: {schedules, timeslots} };
    } catch (error) {
        console.error("Lỗi khi lấy lịch bác sĩ:", error);
        return { EC: -1, EM: "Lỗi server", DT: null };
    }
};

// ---------------------------------------------------------
const createSchedules = async (schedules) => {
    try {
        console.log('===================================================================');
        console.log('Bắt đầu tạo lịch, dữ liệu đầu vào:', schedules);
        
        const doctorId = schedules[0].doctorId;
        console.log(`Tìm bác sĩ với userId: ${doctorId}`);
        
        const doctor = await db.Doctors.findOne({
            where: { userId: doctorId },
            raw: true,
            nest: true
        });
        console.log('Kết quả tìm bác sĩ:', doctor);
        
        if (!doctor) {
            console.log('Không tìm thấy bác sĩ');
            return { EM: "Không tìm thấy bác sĩ!", EC: -1, DT: [] };
        }

        // Kiểm tra gói dịch vụ active
        // Kiểm tra gói dịch vụ active, include Service để lấy maxAppointments
        const doctorService = await db.DoctorService.findOne({
            where: { doctorId: doctor.id, status: 'active' },
            include: [{
                model: db.Service,
                attributes: ['maxAppointments'],
                required: true
            }],
            raw: true,
            nest: true
        });
        console.log('Gói dịch vụ của bác sĩ:', doctorService);
        
        if (!doctorService) {
            console.log('Bác sĩ không có gói dịch vụ active');
            return { EM: "Bác sĩ chưa kích hoạt gói dịch vụ!", EC: -1, DT: [] };
        }

        // Kiểm tra số lịch hẹn trong tháng
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const appointmentCount = await db.Schedule.count({
            where: {
                doctorId: doctor.id,
                date: { [Op.between]: [startOfMonth, endOfMonth] }
            }
        });
        console.log(`Tổng số lịch hẹn trong tháng: ${appointmentCount}`);

        // Kiểm tra giới hạn lịch hẹn
        if (doctorService.Service.maxAppointments && appointmentCount + schedules.length > doctorService.Service.maxAppointments) {
            console.log('Vượt quá giới hạn lịch hẹn');
            return { 
                EM: "Số lịch hẹn trong tháng đã vượt quá giới hạn cho gói hiện tại. Vui lòng xoá bớt lịch hẹn cũ hoặc nâng cấp gói để tiếp tục đặt lịch.", 
                EC: -1, 
                DT: [] 
            };
        }
        
        const formattedSchedules = schedules.map(schedule => ({
            ...schedule,
            doctorId: doctor.id,
            error: 0
        }));
        console.log('Dữ liệu lịch sau định dạng:', formattedSchedules);
        
        const newSchedules = await db.Schedule.bulkCreate(formattedSchedules);
        console.log('Kết quả tạo lịch:', newSchedules);
        
        if (!newSchedules || newSchedules.length === 0) {
            console.log('Không tạo được lịch');
            return { EM: "Không thể tạo lịch làm việc, vui lòng thử lại!", EC: -1, DT: [] };
        }
        await syncData.syncSpecialtiesData();
        await syncData.syncFacilitiesData();
        await syncData.syncDoctorsData();
        console.log('Tạo lịch thành công');
        return { EM: "Tạo lịch làm việc thành công!", EC: 0, DT: newSchedules };
    } catch (error) {
        console.error('Lỗi khi tạo lịch làm việc:', error);
        return { EM: "Có lỗi xảy ra, vui lòng thử lại sau!", EC: -1, DT: null };
    }
};

// ---------------------------------------------------------
const updateSchedule = async (scheduleData) => {
    try {
        const [updatedCount] = await db.Schedule.update(scheduleData, {
            where: { id: scheduleData.id }
        });

        // Kiểm tra xem có bản ghi nào được cập nhật không
        if (updatedCount === 0) {
            return { 
                EM: "Không tìm thấy lịch để cập nhật hoặc dữ liệu không thay đổi!", 
                EC: -1, 
                DT: [] 
            };
        }
        await syncData.syncSpecialtiesData();
        await syncData.syncFacilitiesData();
        await syncData.syncDoctorsData();
        return { 
            EM: "Cập nhật thành công lịch làm việc!", 
            EC: 0, 
            DT: [] 
        };
    } catch (error) {
        console.error("Lỗi khi cập nhật lịch làm việc:", error);
        return { EC: -1, EM: "Lỗi hệ thống! Không thể cập nhật lịch làm việc.", DT: null };
    }
}

// ---------------------------------------------------------
export default {
    getSchedules,
    getSchedulesOfDoctor,
    getSchedulesAndTimeSlotOfDoctor,
    getTimeslotsNotInScheduleByScheduleId,

    createSchedules,
    updateSchedule,
}