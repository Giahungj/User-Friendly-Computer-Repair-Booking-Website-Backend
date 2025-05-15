import db from "../models";
import { Op } from 'sequelize';
import dataFormatterUtil from '../utils/dataFormatterUtil';
import formatUtils from '../utils/formatUtil';
const esClient = require('../services/elasticsearch');

// ---------------------------------------------------------
const getAllDoctors = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;
        const today = new Date().toISOString().split("T")[0];
        let { count, rows } = await db.Doctors.findAndCountAll({
            include: [
                { model: db.User },
                { model: db.Specialty },
                { model: db.Facility }
            ],
            limit: limit,
            offset: offset,
            raw: true,
            nest: true,
        });
        const bookingsToday = await db.Booking.findAndCountAll({
            where: { date: today },
            raw: true,
            nest: true
        })
        let bookingsCompleted = await db.Booking.findAndCountAll({
            where: { status: 1, date: { [Op.lt]: today } },
            raw: true,
            nest: true
        })
        const totalBookingsToday = bookingsToday.count;
        bookingsCompleted = bookingsCompleted.count
        if (rows.length > 0) {
            return { EM: "", EC: 0, DT: { 
                data: rows, 
                totalBookingsToday: totalBookingsToday, 
                bookingsCompleted: bookingsCompleted,
                total: count, 
                totalPages: Math.ceil(count / limit) 
            }
        };
        } else {
            return { EM: "Không có bác sĩ nào!", EC: 1, DT: { data: [], total: 0, totalPages: 0, }};
        }
    } catch (error) {
        console.error("Lỗi server!", error);
        return {
            EM: "Lỗi server!",
            EC: -1,
            DT: {
                data: [],
                total: 0,
                totalPages: 0,
            }
        };
    }
};

// ---------------------------------------------------------
const getDoctorById = async (id, page) => {
    try {
        const offset = (page - 1) * 5;

        // Lấy thông tin bác sĩ cùng với các bảng liên quan
        const doctor = await db.Doctors.findOne({
            where: { id: id },
            include: [
                { model: db.User },
                { model: db.Specialty },
                { model: db.Facility },
            ],
            raw: true,
            nest: true 
        });
        if (!doctor) { 
            return { EM: "Không tìm thấy bác sĩ!", EC: -1, DT: [] }; 
        }
        // Format các trường của bác sĩ
        doctor.price = formatUtils.formatCurrency(doctor.price);
        doctor.createdAt = formatUtils.formatDate(doctor.createdAt);
        doctor.updatedAt = formatUtils.formatDate(doctor.updatedAt) || "Chưa cập nhật";

        // Lấy dữ liệu giờ khám
        const timeSlot = await db.Timeslot.findAll({
            raw: true,
            nest: true
        });
        if (!timeSlot || timeSlot.length === 0) { 
            return { EM: "Không tải được dữ liệu giờ khám!", EC: -1, DT: [] }; 
        }

        // Lấy dữ liệu lịch làm việc của bác sĩ, có phân trang và sắp xếp theo ngày giảm dần
        const scheduleResult = await db.Schedule.findAndCountAll({
            where: { doctorId: id },
            include: [{ model: db.Timeslot }],
            limit: 5,
            offset: offset,
            order: [['date', 'DESC']], 
            nest: true
        });
        const { count, rows: schedules } = scheduleResult;
        if (!schedules) {
            return { EM: "Không tải được dữ liệu lịch làm việc!", EC: -1, DT: [] };
        }
        
        const totalPages = Math.ceil(count / 5);
        const scheduleUpdate = {
            schedules,
            total: count,
            totalPages
        };

        // Lấy dữ liệu đặt chỗ cho từng lịch làm việc
        let bookings = await db.Booking.findAll({
            include: [
              { model: db.Schedule, where: { doctorId: id }, include: [{ model: db.Timeslot }] },
              { model: db.Patient, include: [{ model: db.User }] }
            ],
            limit: 10,
            raw: true,
            nest: true,
        });
          
        if (!bookings) { return { EM: "Không tải được dữ liệu lịch hẹn!", EC: -1, DT: [] }; }
        bookings = bookings.flat();
        return { 
            EM: "", 
            EC: 0, 
            DT: { doctor, schedules: scheduleUpdate, timeSlot, bookings, totalBookings: bookings.length } 
        };
    } catch (error) {
        console.error(error);
        return { EM: "Something wrong from service!!!", EC: -1, DT: [] };
    }
};

// ---------------------------------------------------------
const searchDoctorsByKeyword = async (keyword) => {
	try {
		const doctors = await db.Doctors.findAll({
            include: [
                {
                    model: db.User,
                    where: {
                        name: { [Op.like]: `%${keyword}%` } // Chỉ tìm theo trường name của User
                    }
                },
                { model: db.Specialty, required: false },
                { model: db.Facility, required: false }
            ],
            nest: true,
            raw: true
        });

		console.log('🔍 Từ khóa tìm kiếm:', keyword);
		console.log('📋 Số kết quả:', doctors.length);
		console.log('📦 Dữ liệu:', doctors);

		return {
			EM: "",
			EC: 0,
			DT: {
				data: doctors,
				total: doctors.length
			}
		};
	} catch (error) {
		console.error('❌ [SearchDoctorsByKeyword]', error);
		return {
			EM: "Lỗi server!",
			EC: -1,
			DT: { data: [], total: 0 }
		};
	}
};

// ---------------------------------------------------------
export default {
    getAllDoctors,
    getDoctorById,
    searchDoctorsByKeyword,
}