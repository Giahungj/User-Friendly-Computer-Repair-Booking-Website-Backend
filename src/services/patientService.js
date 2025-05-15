import db from "../models";
import formatUtils from '../utils/formatUtil';

// ---------------------------------------------------------
const getPatientById = async (id, page) => {
    try {
        const offset = (page - 1) * 5;

        // Lấy thông tin bác sĩ cùng với các bảng liên quan
        let patient = await db.Patient.findOne({
            where: { id: id },
            include: [
                { model: db.User },
            ],
            raw: true,
            nest: true 
        });
        if (!patient) { 
            return { EM: "Không tìm thấy nguời dùng!", EC: -1, DT: [] }; 
        }

        patient.createdAt = formatUtils.formatDate(patient.createdAt);
        patient.updatedAt = formatUtils.formatDate(patient.updatedAt) || "Chưa cập nhật";
        patient.User.sex = patient.User.sex === 1 ? "Nam" : patient.User.sex === 0 ? "Nữ" : "";

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        // Đặt thời gian về đầu ngày để so sánh chính xác
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        dayAfterTomorrow.setHours(23, 59, 59, 999);

        let bookings = await db.Booking.findAll({
            where: {
                patientId: id,
                status: 1,
                date: {
                    [db.Sequelize.Op.between]: [today, dayAfterTomorrow]
                }
            },
            attributes: ['id', 'status', 'date'],
            include: [
                {
                    model: db.Schedule,
                    attributes: ['id', 'date'],
                    include: [
                        {
                            model: db.Doctors,
                            attributes: ['id'],
                            include: [{ model: db.User, attributes: ['id', 'name'] }]
                        },
                        {
                            model: db.Timeslot,
                            attributes: ['id', 'startTime', 'endTime', 'shift']
                        }
                    ]
                }
            ],
            order: [['updatedAt', 'DESC']],
            raw: true,
            nest: true
        });

        // Lấy dữ liệu lịch sử khám của bệnh nhân
        let historys = await db.Booking.findAndCountAll({
            where: {patientId: id, status: 2 },
            attributes: ['id', 'status', 'date'],
            include: [
                {
                    model: db.Schedule,
                    attributes: ['id', 'date'],
                    include: [
                        {
                            model: db.Doctors,
                            attributes: ['id'],
                            include: [{ model: db.User, attributes: ['id', 'name'] }]
                        },
                        {
                            model: db.Timeslot,
                            attributes: ['id', 'startTime', 'endTime', 'shift']
                        }
                    ]
                },
                { model: db.History, attributes: ['id'] }
            ],
            limit: 5,
            offset: offset,
            order: [['updatedAt', 'DESC']],
            raw: true,
            nest: true
        });
          
        if (!historys) { return { EM: "Không tải được dữ liệu lịch hẹn!", EC: -1, DT: [] }; }

        const { count, rows } = historys;
        const totalPages = Math.ceil(count / 5);
        return { 
            EM: "", 
            EC: 0, 
            DT: { patient, bookings, historys: rows, total: totalPages } 
        };
    } catch (error) {
        console.error(error);
        return { EM: "Something wrong from service!!!", EC: -1, DT: [] };
    }
};

// ---------------------------------------------------------
const getPatients = async (id, page) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const bookings = await db.Booking.findAll({
            raw: true, nest: true,
            where: {
                date: today
            },
            include: [
                { model: db.Patient, include: [{ model: db.User }] },
                { model: db.Schedule, include: [{ model: db.Doctors, include: [{ model: db.User }] }, { model: db.Timeslot }] },
            ]
        });

        const result = bookings.map(item => {
            const formatTime = (timeStr) => timeStr?.slice(0, 5);
			const shift = item.Schedule.Timeslot.shift === 1 ? 'Sáng' :
						  item.Schedule.Timeslot.shift === 2 ? 'Chiều' : 'Tối';
            return {
                bookingId: item.id,
                scheduleId: item.Schedule.id,
                patientId: item.Patient.id,
                patientName: item.Patient.User.name,
                doctorId: item.Schedule.Doctor.User.name,
                doctorName: item.Schedule.Doctor.User.name,
                date: formatUtils.formatDate(item.date),
                startTime: formatTime(item.Schedule.Timeslot.startTime),
				endTime: formatTime(item.Schedule.Timeslot.endTime),
			    shift: shift

            };
        });
    
        return {
            EC: 0,
            EM: 'Lấy lịch hẹn của bệnh nhân thành công',
            DT: result
        };
    } catch (error) {
        console.error('Lỗi khi lấy lịch hẹn bệnh nhân:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy lịch hẹn bệnh nhân',
            DT: []
        };
    }
};



export default { getPatientById, getPatients }