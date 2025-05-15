import db from "../models";
import { Op } from "sequelize";
import { where } from "sequelize/lib/sequelize";
import formatUtil from '../utils/formatUtil';

// ---------------------------------------------------------
const getFeaturedDoctors = async () => {
    try {
        const doctors = await db.Doctors.findAll({
            include: [
                {
                    model: db.Schedule,
                    include: [
                        {
                            model: db.Booking,
                            where: { status: 2 },
                            required: false,
                            attributes: ['id'],
                            include: [{ model: db.Rating, attributes: ['score'] }],
                        },
                    ],
                    attributes: ['id'],
                },
                { model: db.User, attributes: ['id', 'name', 'avatar'] },
                { model: db.Specialty, attributes: ['id', 'name'] },
                { model: db.Facility, attributes: ['id', 'name'] },
            ],
            attributes: ['id', 'price'],
        });

        const doctorsWithBookingCountAndAvgScore = doctors.map(doctor => {
            let bookingCount = 0;
            let totalScore = 0;
            let ratingCount = 0;

            doctor.Schedules.forEach(schedule => {
                bookingCount += schedule.Bookings.length;
                schedule.Bookings.forEach(booking => {
                    if (booking.Rating && booking.Rating.score !== null) {
                        totalScore += booking.Rating.score;
                        ratingCount++;
                    }
                });
            });

            const averageScore = ratingCount > 0 ? parseFloat((totalScore / ratingCount).toFixed(1)) : 0;

            return {
                id: doctor.id,
                price: formatUtil.formatCurrency(doctor.price),
                User: doctor.User,
                Specialty: doctor.Specialty,
                Facility: doctor.Facility,
                bookingCount: bookingCount,
                averageScore: averageScore,
            };
        });

        const sortDoctorsByAvgScoreAndBooking = (doctors) => {
            return doctors.sort((a, b) => {
                // Ưu tiên điểm trung bình giảm dần
                if (b.averageScore !== a.averageScore) {
                    return b.averageScore - a.averageScore;
                }
                // Nếu điểm trung bình bằng nhau, sắp xếp theo số lượng booking giảm dần
                return b.bookingCount - a.bookingCount;
            });
        };

        const sortedDoctors = sortDoctorsByAvgScoreAndBooking(doctorsWithBookingCountAndAvgScore);
        const top6Doctors = sortedDoctors.slice(0, 6);

        return { EM: "", EC: 0, DT: top6Doctors };
    } catch (error) {
        console.error("Lỗi khi lấy bác sĩ nổi bật:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
const getAllDoctor = async () => {
    try {
        const doctors = await db.Doctors.findAll({
            include: [
                { model: db.Specialty },
                { model: db.Facility },
                { model: db.User },
            ],
            raw: true,
            nest: true
        });

        return { EM: "", EC: 0, DT: doctors };
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
const getDoctorById = async (doctorId) => {
    try {
        let doctor = await db.Doctors.findOne({
            where: { id: doctorId },
            include: [
                { model: db.Schedule },
                { model: db.Facility },
                { model: db.User },
                { model: db.Specialty },
            ],
            raw: true,
            nest: true
        });
        const ratings = await db.Rating.findAll({
            where: { doctorId: doctorId },
            include: [{ model: db.Patient, include: [{ model: db.User}] }],
            order: [['createdAt', 'DESC']],
        })
        const now = new Date();

        const schedules = await db.Schedule.findAll({
                where: {
                        doctorId: doctorId,
                        [Op.or]: [
                                { date: { [Op.gt]: now } }, // ngày trong tương lai
                                {
                                        date: { [Op.eq]: now.toISOString().slice(0, 10) }, // hôm nay
                                        '$Timeslot.endTime$': { [Op.gt]: now.toTimeString().slice(0, 5) } // endTime > giờ hiện tại
                                }
                        ]
                },
                include: [{ model: db.Timeslot }],
                order: [['date', 'DESC'], ['Timeslot', 'startTime', 'ASC']],
                raw: true,
                nest: true
        });
        
         // Kiểm tra nếu không có đánh giá nào
        if (!ratings.length) {
            return { EM: "", EC: 0, DT: { doctor, schedules, ratings, averageScore: 0 }}; // Không có đánh giá nào
        }
        // Tính tổng điểm
        const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
        // Tính điểm trung bình, làm tròn 1 chữ số thập phân
        const averageScore = (totalScore / ratings.length).toFixed(1);
        return { EM: "", EC: 0, DT: { doctor, schedules, ratings, averageScore }};
    } catch (error) {
        console.error("Lỗi khi cập nhật chuyên khoa của bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
const updateDoctor = async (doctorData) => {
    try {
        const [affectedRows] = await db.Doctors.update(
            {
                experience: doctorData.experience,
                price: doctorData.price,
                infor: doctorData.infor
            },
            {
                where: { id: doctorData.doctorId }
            }
        );

        if (affectedRows === 0) {
            return { EM: "Không tìm thấy bác sĩ để cập nhật!", EC: 1, DT: [] };
        }

        return { EM: "Cập nhật thành công!", EC: 0, DT: {} };
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: -1, DT: [] };
    }
};

// ---------------------------------------------------------
const updateDoctorSpecialty = async (specialtyId) => {
    try {
        if (!specialtyId) { return { EM: "ID chuyên khoa không hợp lệ.", EC: -1, DT: [] }; }
        const [affectedRows] = await db.Doctors.update(
            { specialtyId: null },
            { where: { specialtyId: specialtyId } }
        );
        if (affectedRows === 0) { return { EM: "Không có bác sĩ nào thuộc chuyên khoa này.", EC: -1, DT: [] }; }
        return { EM: "Cập nhật chuyên khoa của bác sĩ thành công.", EC: 0, DT: [] };
    } catch (error) {
        console.error("Lỗi khi cập nhật chuyên khoa của bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
const getPatientsOfDoctor = async (doctorId) => {
    try {
        // Lấy schedules và bookings
        const schedules = await db.Schedule.findAll({ where: { doctorId }, raw: true });
        const scheduleIds = schedules.map(schedule => schedule.id);
        const bookings = await db.Booking.findAll({
            where: { status: 2, scheduleId: scheduleIds },
            raw: true
        });
        // Lọc và lấy unique patientIds
        const filteredResult = schedules
            .map(schedule => ({
                bookings: bookings.filter(booking => booking.scheduleId === schedule.id)
            }))
            .filter(item => item.bookings.length > 0);

        const uniquePatientIds = [...new Set(filteredResult.flatMap(item => item.bookings.map(booking => booking.patientId)))];
        // Nếu không có patientId nào, trả về sớm
        if (!uniquePatientIds.length) {
            return {
                EC: 0,
                EM: 'Không tìm thấy bệnh nhân nào của bác sĩ này!',
                DT: []
            };
        }
        // Đếm số lượng booking cho từng patientId
        const bookingCount = bookings.reduce((acc, booking) => {
            acc[booking.patientId] = (acc[booking.patientId] || 0) + 1;
            return acc;
        }, {});
        // Lấy thông tin patients
        const patients = await db.Patient.findAll({
            where: { id: uniquePatientIds },
            include: [{ model: db.User }],
            raw: true
        });
        // Định dạng dữ liệu trả về, thêm số lượng booking
        const formattedPatients = patients.map(patient => ({
            patientId: patient.id,
            name: patient['User.name'] || 'Không có tên',
            phoneNumber: patient['User.phone'],
            dateOfBirth: patient['User.dateofbirth'],
            bookingCount: bookingCount[patient.id] || 0 // Số lượng booking của bệnh nhân này
        }));
        console.log(formattedPatients)
        return {
            EC: 0,
            EM: 'Thành công lấy danh sách bệnh nhân',
            DT: formattedPatients
        };
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// --------------------------------------------------
const getDoctorsBySpecialty = async (specialtyId, excludeDoctorId, limit) => {
    try {
        const whereCondition = { specialtyId };
        if (excludeDoctorId) {
            whereCondition.id = { [Op.ne]: excludeDoctorId };
        }

        // Lấy ngày hiện tại và 7 ngày tiếp theo
        const today = new Date();
        const dateRange = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return date.toISOString().split('T')[0];
        });

        const doctors = await db.Doctors.findAll({
            where: whereCondition,
            include: [
                { model: db.User },
                { model: db.Specialty },
                { model: db.Facility }
            ]
        });

        const formattedDoctors = [];
        for (const doctor of doctors) {
            const schedules = await db.Schedule.findAll({
                where: { 
                    doctorId: doctor.id,
                    date: { [Op.in]: dateRange },
                    currentNumber: { [Op.lt]: db.sequelize.col('maxNumber') } // Lịch trống
                },
                include: [{ model: db.Timeslot, attributes: ['startTime', 'endTime'] }],
                order: [['date', 'ASC'], [db.Timeslot, 'startTime', 'ASC']]
            });

            formattedDoctors.push({
                id: doctor.id,
                price: doctor.price,
                User: { name: doctor.User.name, avatar: doctor.User.avatar },
                Specialty: { name: doctor.Specialty.name },
                Facility: doctor.Facility ? { name: doctor.Facility.name, address: doctor.Facility.address } : null,
                hasAvailableSchedules: schedules.length > 0,
                schedules: schedules.map(schedule => ({
                    id: schedule.id,
                    date: schedule.date,
                    currentNumber: schedule.currentNumber,
                    maxNumber: schedule.maxNumber,
                    Timeslot: { 
                        startTime: schedule.Timeslot.startTime, 
                        endTime: schedule.Timeslot.endTime 
                    }
                }))
            });
        }

        // Sắp xếp bác sĩ: ưu tiên có lịch trống và lịch sớm nhất
        formattedDoctors.sort((a, b) => {
            const hasScheduleA = a.schedules.length > 0;
            const hasScheduleB = b.schedules.length > 0;

            if (hasScheduleA && !hasScheduleB) return -1; // A có lịch, B không có
            if (!hasScheduleA && hasScheduleB) return 1;  // B có lịch, A không có
            if (!hasScheduleA && !hasScheduleB) return 0; // Cả hai không có lịch

            const earliestDateA = a.schedules[0].date;
            const earliestDateB = b.schedules[0].date;
            return new Date(earliestDateA) - new Date(earliestDateB);
        });

        if (formattedDoctors.length === 0) {
            return {
                EC: 0,
                EM: 'Không tìm thấy bác sĩ!',
                DT: []
            };
        }

        return {
            EC: 0,
            EM: 'Thành công lấy dữ liệu bác sĩ đề xuất',
            DT: formattedDoctors
        };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bác sĩ liên quan:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// --------------------------------------------------
const getVisitedDoctors = async (patientId) => {
    try {
        console.log(`🔍 Bắt đầu lấy danh sách bác sĩ đã khám cho bệnh nhân ID: ${patientId}`);

        const bookings = await db.Booking.findAll({
            where: { patientId, status: 2 }, // Kiểm tra nếu status là số
            include: [{ model: db.Schedule }]
        });

        console.log("📌 Dữ liệu `bookings` lấy từ DB:", JSON.stringify(bookings, null, 2));

        if (!bookings || bookings.length === 0) {
            console.log("⚠️ Bệnh nhân chưa khám bác sĩ nào!");
            return {
                EC: 0,
                EM: 'Bệnh nhân chưa khám bác sĩ nào!',
                DT: []
            };
        }

        // Lấy danh sách doctorId từ bảng Schedule
        const doctorIds = Array.from(
            new Set(
                bookings
                    .map(booking => booking.Schedule?.doctorId)
                    .filter(id => id !== null && id !== undefined)
            )
        );

        console.log("✅ Danh sách doctorId đã từng khám:", doctorIds);

        if (doctorIds.length === 0) {
            console.log("⚠️ Không tìm thấy bác sĩ nào từ danh sách lịch hẹn.");
            return {
                EC: 0,
                EM: 'Không tìm thấy bác sĩ từ lịch hẹn!',
                DT: []
            };
        }

        // Lấy thông tin bác sĩ từ bảng Doctors
        const doctors = await db.Doctors.findAll({
            where: { id: doctorIds },
            include: [
                { model: db.User, attributes: ['name', 'avatar', 'email'] },
                { model: db.Specialty, attributes: ['name'] },
                { model: db.Facility, attributes: ['name', 'address'] }
            ]
        });

        if (!doctors || doctors.length === 0) {
            console.log("⚠️ Không tìm thấy thông tin bác sĩ nào trong cơ sở dữ liệu!");
            return {
                EC: 0,
                EM: 'Không tìm thấy thông tin bác sĩ!',
                DT: []
            };
        }

        // Định dạng lại danh sách bác sĩ
        const formattedDoctors = doctors.map(doctor => ({
            id: doctor.id,
            price: doctor.price,
            User: {
                name: doctor.User?.name || "N/A",
                avatar: doctor.User?.avatar || null,
                email: doctor.User?.email || "N/A"
            },
            Specialty: { name: doctor.Specialty?.name || "Chưa cập nhật" },
            Facility: doctor.Facility
                ? { name: doctor.Facility.name, address: doctor.Facility.address }
                : null
        }));

        return {
            EC: 0,
            EM: 'Thành công lấy danh sách doctorId đã từng khám',
            DT: formattedDoctors
        };
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bác sĩ đã khám:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
export default {
    getFeaturedDoctors,
    getAllDoctor,
    getDoctorById,
    getDoctorsBySpecialty,
    getVisitedDoctors,

    getPatientsOfDoctor,
    updateDoctorSpecialty,
    updateDoctor
}