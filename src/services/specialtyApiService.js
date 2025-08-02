import { where } from "sequelize/lib/sequelize";
import db from "../models"
import { Op } from "sequelize"

// ---------------------------------------------------------
const getSpecialtyList = async () => {
    try {
        const hasDeletedField = db.Specialty.rawAttributes.hasOwnProperty('deleted')
        let specialties = await db.Specialty.findAll({
            raw: true,
            nest: true,
            where: hasDeletedField ? { deleted: false } : {},
            order: [['updatedAt', 'DESC']]
        })
        let deletedSpecialties = await db.Specialty.findAll({
            raw: true,
            nest: true,
            where: {
                deleted: true 
            },
            order: [['updatedAt', 'DESC']],
            limit: 10
        })
        for (let specialty of specialties) {
            specialty.doctorsCount = await db.Doctors.count({
                where: { specialtyId: specialty.id }
            });
            specialty.image = specialty.image ? '/images/uploads/' + specialty.image : '/images/user.png';
        }
        return {
            EM: "",
            EC: 0,
            DT: { deletedSpecialties, specialties }
        }
    } catch (error) {
        console.error("Lỗi đọc dữ liệu chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu chuyên khoa.",
            EC: -1,
            DT: { deletedSpecialties: [], specialties: [] }
        }
    }
}

// ---------------------------------------------------------
const getSpecialtyById = async (specialtyId) => {
    try {
        const specialty = await db.Specialty.findOne({
            where: { id: specialtyId },
            nest: true, raw: true
        });

        if (!specialty) {
            return {
                EM: "Không tìm thấy chuyên khoa",
                EC: 1,
                DT: null
            };
        }
        const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        
        const doctors = await db.Doctors.findAll({
            where: { specialtyId: specialty.id },
            include: [{ model: db.User }, { model: db.Facility }], raw: true, nest: true
        })

        const doctorSchedules = await Promise.all(doctors.map(async (doctor) => {
            // lấy lịch của từng bác sĩ
            const schedules = await db.Schedule.findAll({
                where: {
                    doctorId: doctor.id,
                    date: { [Op.gte]: new Date() }
                },
                order: [['date', 'ASC'], ['Timeslot', 'startTime', 'ASC']],
                raw: true,
                nest: true
            });
            
            return {
                ...doctor,
                schedules,
                hasToday: schedules.some(s => s.date === today),
                scheduleCount: schedules.length,
                firstDate: schedules[0]?.date || null
            };
        }));
        
        // sắp xếp theo tiêu chí ưu tiên
        doctorSchedules.sort((a, b) => {
            if (a.hasToday !== b.hasToday) return b.hasToday - a.hasToday;
            if (a.scheduleCount !== b.scheduleCount) return b.scheduleCount - a.scheduleCount;
            if (a.firstDate && b.firstDate) return new Date(a.firstDate) - new Date(b.firstDate);
            return 0;
        });
        // Đếm số lượng bác sĩ trong chuyên khoa
        specialty.doctorsCount = await db.Doctors.count({
            where: { specialtyId: specialty.id }
        });

        console.log("Số lượng bác sĩ trong chuyên khoa:", specialty.doctorsCount);

        // Thiết lập đường dẫn hình ảnh
        specialty.image = specialty.image ? '/images/uploads/' + specialty.image : '/images/user.png';
        
        return {
            EM: "Lấy thông tin chuyên khoa thành công",
            EC: 0,
            DT: { specialty, doctors: doctorSchedules }
        };
    } catch (error) {
        console.error("Lỗi khi lấy thông tin chuyên khoa:", error);
        return {
            EM: "Đã có lỗi xảy ra khi lấy thông tin chuyên khoa",
            EC: -1,
            DT: null
        };
    }
};

// ---------------------------------------------------------
export default {
    getSpecialtyList,
    getSpecialtyById
}