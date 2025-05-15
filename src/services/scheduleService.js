import { raw } from "body-parser";
import db from "../models";
import { Op }  from 'sequelize';
import formatUtils from '../utils/formatUtil';

const getAllSchedule = async (page = 1, date = '', facilityId = '', specialtyId = '',  shift = '', status = '', searchTerm = '') => {
    try {
        const limit = 10;
        console.log("page:", page);
        console.log("date:", date);
        console.log("facilityId:", facilityId);
        console.log("specialtyId:", specialtyId);
        console.log("shift:", shift);
        console.log("status:", status);
        console.log("searchTerm:", searchTerm);
        // Tạo đối tượng where cho truy vấn
        const where = {};
        const whereCondition = {};

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            whereCondition['$User.name$'] = { [Op.like]: `%${searchTerm}%` };
            console.log("Added search term condition:", whereCondition['$User.name$']);
        }

        // Truy vấn danh sách bác sĩ
        const doctorIds = await db.Doctors.findAll({
            attributes: ['id'],
            include: [
                {
                    model: db.User,
                    attributes: ['id'],
                    required: true // Chỉ lấy bác sĩ có User hợp lệ
                },
            ],
            where: whereCondition,
            nest: true,
            raw: true
        });
        const doctorIdList = doctorIds.map(doctor => doctor.id);
        console.log("Doctors found:", doctorIdList);

        if (date) { // Lọc theo ngày (date)
            where.date = date;
        }
        
        if (shift) {// Lọc theo ca (shift)
            where['$Timeslot.shift$'] = shift;
        }
        
        if (status) {
            if (status === 'available') {
                where.currentNumber = { [db.Sequelize.Op.lt]: db.Sequelize.col('maxNumber') }; // currentNumber < maxNumber
            } else if (status === 'full') {
                where.currentNumber = { [db.Sequelize.Op.gte]: db.Sequelize.col('maxNumber') }; // currentNumber >= maxNumber
            }
        }
        // Lọc theo cơ sở y tế (facilityId)
        if (facilityId) {
            where['$Doctor.Facility.id$'] = facilityId;
        }

        // Lọc theo chuyên khoa (specialtyId)
        if (specialtyId) {
            where['$Doctor.Specialty.id$'] = specialtyId;
        }

        // Truy vấn danh sách lịch làm việc
        let { count, rows: schedules } = await db.Schedule.findAndCountAll({
            attributes: ['id', 'date', 'currentNumber', 'maxNumber'],
            include: [
                { 
                    model: db.Timeslot, 
                    attributes: ['id', 'startTime', 'endTime', 'shift'] 
                },
                {
                    model: db.Doctors,
                    attributes: ['id'],
                    where: {
                        id: doctorIdList // Điều kiện lọc để chỉ lấy các bác sĩ có id trong doctorIds
                    },
                    include: [
                        {
                            model: db.User,
                            attributes: ['id', 'name']
                        },
                        {
                            model: db.Specialty,
                            attributes: ['id', 'name']
                        },
                        {
                            model: db.Facility,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            where,
            order: [['date', 'DESC']],
            limit,
            offset: (page - 1) * limit,
            nest: true,
            raw: true
        });

        if (!schedules || schedules.length === 0) {
            return { EM: "Không có lịch làm việc!", EC: 1, DT: [] };
        }
        schedules.forEach(schedule => {
            console.log("Schedules after filtering:", schedule.Doctor);
        });
        const totalPages = Math.ceil(count / limit);
        schedules = schedules
            .map(schedule => ({
                ...schedule,
                date: formatUtils.formatDate(schedule.date)
            }));
        
        return {
            EM: 'Lấy dữ liệu lịch làm việc thành công!',
            EC: 0,
            DT: {
                schedules,
                totalPages,
                currentPage: page
            }
        };
    } catch (error) {
        console.error('Lỗi getAllSchedule:', error);
        return { EM: "Lỗi server khi lấy lịch làm việc!", EC: -1, DT: [] };
    }
};

// ---------------------------------------------------------
const createSchedule = async (fieldData) => {
    try {
        const { doctorId, date, timeSlotId, maxNumber } = fieldData;

        // 1. Lấy gói dịch vụ active của bác sĩ
        const doctorService = await db.DoctorService.findOne({
            where: { doctorId, status: 'active' },
            include: [{ model: db.Service, attributes: ['maxAppointments'] }],
            raw: true
        });

        let maxAppointments;
        let isFreePlan = false;

        if (!doctorService) {
            // Bác sĩ chưa có gói, áp dụng giới hạn miễn phí: 5 lịch hẹn/tháng
            maxAppointments = 5;
            isFreePlan = true;
        } else {
            maxAppointments = doctorService['Service.maxAppointments'];
        }

        // 2. Đếm số lịch hẹn hiện tại
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const existingSchedulesCount = await db.Schedule.count({
            where: {
                doctorId,
                date: {
                    [Op.between]: [startOfMonth, endOfMonth] // Kiểm tra trong tháng nếu là gói miễn phí
                }
            }
        });

        // 3. Kiểm tra giới hạn lịch hẹn
        if (existingSchedulesCount + timeSlotId.length > maxAppointments) {
            const errorMessage = isFreePlan
                ? `Vượt quá giới hạn ${maxAppointments} lịch hẹn miễn phí mỗi tháng`
                : `Vượt quá giới hạn ${maxAppointments} lịch hẹn mỗi ngày`;
            return { 
                EM: errorMessage, 
                EC: -1, 
                DT: [] 
            };
        }

        // Phần còn lại của mã giữ nguyên
        // 4. Kiểm tra lịch trùng lặp
        const existingSchedules = await db.Schedule.findAll({
            where: {
                doctorId,
                date,
                timeSlotId: { [Op.in]: timeSlotId }
            },
            include: [{ model: db.Timeslot, attributes: ['startTime', 'endTime'] }],
            raw: true
        });

        if (existingSchedules.length > 0) {
            const existingSlots = existingSchedules.map(schedule => 
                `${schedule['Timeslot.startTime']} - ${schedule['Timeslot.endTime']}`
            );
            return { 
                EM: `Lịch đã tồn tại cho các khung giờ: ${existingSlots.join(', ')}! Vui lòng chọn khung giờ khác!`, 
                EC: 1, 
                DT: existingSchedules 
            };
        }

        // 5. Tạo lịch mới
        let appointments = timeSlotId.map((slot, index) => ({
            doctorId,
            date,
            currentNumber: 0,
            maxNumber: maxNumber[index],
            timeSlotId: slot
        }));

        const newSchedules = await db.Schedule.bulkCreate(appointments, { returning: true });
        if (!newSchedules || newSchedules.length === 0) {
            return { EM: 'Không thể tạo lịch làm việc!', EC: 1, DT: [] };
        }

        return { EM: 'Tạo thành công lịch làm việc!', EC: 0, DT: [] };
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            return { EM: 'Dữ liệu không hợp lệ!', EC: -1, DT: error.errors };
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            return { EM: 'Lịch này đã tồn tại!', EC: -1, DT: error.errors };
        } else {
            return { EM: 'Lỗi hệ thống! Không thể tạo lịch làm việc.', EC: -1, DT: [] };
        }
    }
};

// ---------------------------------------------------------
export default {
    getAllSchedule,
    createSchedule
}