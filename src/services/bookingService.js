import db from "../models";
import dataFormatterUtil from '../utils/dataFormatterUtil';
import formatUtils from '../utils/formatUtil';
import { Op }  from 'sequelize';

// ---------------------------------------------------------
const getAllBookings = async (page = 1, date = '', timeslot = '', status = '', searchTerm = '') => {
    try {
        const limit = 10;
        const offset = (page - 1) * limit;

        // Log các tham số nhận được
        console.log('Query Parameters:', { page, date, timeslot, status, searchTerm });

        // Tạo đối tượng where cho truy vấn
        const where = {};
        const whereCondition = {};

        // Lọc theo từ khóa tìm kiếm (chỉ tên bác sĩ)
        if (searchTerm) {
            whereCondition['$Schedule.Doctor.User.name$'] = { [Op.like]: `%${searchTerm}%` };
            console.log('Added search term condition:', whereCondition['$Schedule.Doctor.User.name$']);
        }

        // Lọc theo ngày
        if (date) {
            where.date = date;
        }

        // Lọc theo timeslot
        if (timeslot) {
            where['$Schedule.Timeslot.id$'] = timeslot;
        }

        // Lọc theo trạng thái
        if (status) {
            where.status = status === 'completed' ? 2 : status === 'confirmed' ? 1 : status === 'canceled' ? -1 : null;
        }

        // Truy vấn danh sách đặt lịch
        let { count, rows: bookings } = await db.Booking.findAndCountAll({
            attributes: ['id', 'date', 'status', 'createdAt'],
            include: [
                {
                    model: db.Schedule,
                    attributes: ['id'],
                    include: [
                        {
                            model: db.Timeslot,
                            attributes: ['id', 'shift', 'startTime', 'endTime']
                        },
                        {
                            model: db.Doctors,
                            attributes: ['id'],
                            include: [
                                {
                                    model: db.User,
                                    attributes: ['id', 'name']
                                }
                            ]
                        }
                    ]
                }
            ],
            where: { ...where, ...whereCondition },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            raw: true,
            nest: true
        });

        // Nếu không có booking, trả về thông báo
        if (!bookings || bookings.length === 0) {
            return {
                EM: 'Không có lịch đặt khám!',
                EC: 1,
                DT: {
                    timeSlots: { 1: [], 2: [], 3: [] },
                    bookingData: [],
                    confirmBookings: 0,
                    todayBookings: 0,
                    total: 0,
                    totalPages: 0
                }
            };
        }

        // Truy vấn danh sách timeslots và nhóm theo shift
        const timeSlots = await db.Timeslot.findAll({
            attributes: ['id', 'startTime', 'endTime', 'shift'],
            order: [['shift', 'ASC'], ['startTime', 'ASC']]
        });

        const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
            const shift = slot.shift;
            if (!acc[shift]) {
                acc[shift] = [];
            }
            acc[shift].push({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                shift: slot.shift
            });
            return acc;
        }, {});

        const formattedTimeSlots = {
            1: groupedTimeSlots[1] || [],
            2: groupedTimeSlots[2] || [],
            3: groupedTimeSlots[3] || []
        };

        // Đếm số booking trạng thái confirmed (status = 2)
        const confirmBookings = await db.Booking.count({
            where: { status: 2 }
        });

        // Đếm số booking hôm nay
        const today = new Date();
        const formattedToday = formatUtils.formatDate(today);
        const todayBookings = bookings.filter(bo => formatUtils.formatDate(bo.date) === formattedToday);

        // Format lại dữ liệu booking
        const bookingData = bookings.map(bo => ({
            ...bo,
            date: formatUtils.formatDate(bo.date)
        }));

        return {
            EM: 'Lấy dữ liệu lịch đặt khám thành công!',
            EC: 0,
            DT: {
                timeSlots: formattedTimeSlots,
                bookingData,
                confirmBookings,
                todayBookings: todayBookings.length,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        console.error('Lỗi getAllBookings:', error);
        return {
            EM: 'Lỗi server khi lấy lịch đặt khám!',
            EC: -1,
            DT: {
                timeSlots: { 1: [], 2: [], 3: [] },
                bookingData: [],
                confirmBookings: 0,
                todayBookings: 0,
                total: 0,
                totalPages: 0
            }
        };
    }
};

// ---------------------------------------------------------
export default {
    getAllBookings,
}