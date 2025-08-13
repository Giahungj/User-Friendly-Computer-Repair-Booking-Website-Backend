import { where } from "sequelize/lib/sequelize";
import db from "../models";
import { Op } from "sequelize";
import notificationService from "../services/notificationApiService";
import syncData from "../utils/syncData";
// --------------------------------------------------
const createNewBooking = async (scheduleId, patientId, date, description) => {
    try {
        const patient = await db.Patient.findOne({
            where: { userId: patientId }, raw: true, nest: true
        })
        if (!patient) { 
            return { EM: "Đã tạo lịch hẹn thất bại!", EC: 1, DT: []}
        }
        let resuilt = await db.Booking.create({ 
            status: 1,
            scheduleId: scheduleId,
            patientId: patient.id,
            date: date,
            description: description
        });
        if (resuilt) {
            let schedule = await db.Schedule.findOne({
                where: { id: scheduleId },
            });
            await schedule.update({
                currentNumber: schedule.currentNumber + 1,
            });
            let booking = await db.Booking.findOne({
                where: { id: resuilt.id },
                include: [
                    {
                        model: db.Schedule,
                        include: [
                            {
                                model: db.Doctors,
                                include: [{ model: db.User }]
                            },
                            { model: db.Timeslot }
                        ]
                    },
                    {
                        model: db.Patient,
                        include: [{ model: db.User }]
                    }
                ],
                raw: true,
                nest: true
            });
            return {
                EM: "Đã tạo lịch hẹn thành công!",
                EC: 0,
                DT: booking,
            };
        } else {
            return {
                EM: "Đã tạo lịch hẹn thất bại!",
                EC: -1,
                DT: [],
            };
        }
    } catch (error) {
        console.error("Error in createNewBooking:", error);
        return {
            EM: error,
            EC: -1,
            DT: [],
        };
    }
};

// --------------------------------------------------
const cancelBooking = async (bookingId) => {
    try {
        const booking = await db.Booking.findOne({
            where: { id: bookingId },
            include: [{ model: db.Schedule }],
            raw: true,
            nest: true
        });
        if (!booking) {
            return {
                EM: "Không tìm thấy lịch hẹn!",
                EC: 1,
                DT: {}
            };
        }

        if (booking.Schedule.currentNumber === 0) {
            return {
                EM: "Lịch hẹn này hiện tại không có không còn chỗ trống. Việc hủy lịch hẹn hiện gặp vấn đề! Mong bạn xem xét kỹ lại",
                EC: -1,
            };
        }

        const boookingUpdated = await db.Booking.update(
            { status: '-1' },
            { where: { id: bookingId } } 
        );
        const scheduleUpdated = await db.Schedule.update(
            { currentNumber: booking.Schedule.currentNumber - 1 },
            { where: { id: booking.scheduleId } }
        );
        return {
            EM: "Đã hủy lịch hẹn thành công!",
            EC: 0,
        };
    } catch (error) {
        console.error("Error in cancelBooking:", error);
        return {
            EM: "Something went wrong from service!",
            EC: -1,
        };
    }
};

// --------------------------------------------------
const completeBooking = async (data) => {
    try {
        console.log("📌 Dữ liệu `data` trước khi lưu:", data);
        console.log("📌 Dữ liệu `doctorId` trước khi lưu:", data.doctorId);
        console.log("📌 Dữ liệu `selected` trước khi lưu:", data.selected);
        const booking = await db.Booking.findOne({
            where: { id: data.bookingId },
            include: [{ model: db.History }],
            raw: true,
            nest: true
        });
        const user = await db.Patient.findOne({
            where: { id: data.patientId },
        })
        const userId = user.userId
        console.log("📌 Dữ liệu `userId` trước khi lưu:", userId)
        const doctor = await db.Doctors.findOne({
            where: { userId: data.doctorId }, raw: true, nest: true
        })
        console.log("📌 Dữ liệu `doctor` trước khi lưu:", doctor);
        if (!booking) {
            return {
                EM: "Không tìm thấy lịch hẹn!",
                EC: 1,
                DT: {}
            };
        }

        const promises = data.selected.map(medicine => {
            return db.Prescriptions.create({
                bookingId: data.bookingId,
                medicineId: medicine.id,
                quantity: medicine.quantity,
            });
        });
        
        const result = await Promise.all(promises);

        // Cập nhật trạng thái booking thành "Đã khám xong" (status = 2)
        await db.Booking.update(
            { status: 2 },
            { where: { id: data.bookingId } }
        );
        // Tạo hoặc cập nhật bản ghi trong bảng History
        const historyData = {
            bookingId: data.bookingId,
            diagnosis: data.diagnosis,
            revisitDate: data.revisitDate,
            conditionAssessment: data.conditionAssessment
        };

        const notificationData = {
            userId: userId,
            message: `Lịch khám ${booking.id} đã hoàn thành! Hãy để lại đánh giá của bạn tại đây`,
            action: `/bookings/history/${booking.id}` 
        }
        console.log("🧐 Kiểu dữ liệu của conditionAssessment:", typeof data.conditionAssessment);
        console.log("📌 Dữ liệu `historyData` trước khi lưu:", historyData);
        const history = await db.History.create(historyData);
        const doctorpaymentData = {
            doctorId: doctor.id,
            bookingId: data.bookingId,
            patientId: data.patientId,
            historyId: history.id,
            paymentAmount: doctor.price,
            paymentDate: new Date(),
        }
        const notification = await notificationService.createNotification(notificationData);
        const doctorpayment = await db.DoctorPayments.create(doctorpaymentData);
        console.log("📌 Dữ liệu `notificationData` sau khi lưu:", notification);
        console.log("📌 Dữ liệu `doctorpaymentData` sau khi lưu:", doctorpayment);
        await syncData.syncPatientsData()
        await syncData.syncDoctorsData()
        return {
            EM: "Đã hoàn thành lịch hẹn thành công!",
            EC: 0,
            DT: history
        };
    } catch (error) {
        console.error("Error in completeBooking:", error);
        return {
            EM: "Something went wrong from service!",
            EC: -1,
            DT: {}
        };
    }
};

// --------------------------------------------------
const getAllBookingByDoctorId = async (Id) => {
    try {
        const bookings = await db.Booking.findAll({
            attributes: ['status', 'date'],
            raw: true,
            nest: true,
            include: [
                {
                    model: db.Schedule,
                    include: [{ model: db.Timeslot, attributes: ['startTime', 'endTime'] }],
                    where: { doctorId: Id }
                },
            ],
            include: [
                {
                    model: db.Patient,
                    attributes: ['citizenId'],
                    include: [
                        {
                            model: db.User,
                            attributes: ['name', 'phone'],
                        },
                    ],
                },
            ],
        });
        if (bookings) {
            return {
                EM: "Get data success!",
                EC: 0,
                DT: bookings
            }
        } else {
            return {
                EM: "Get data success!",
                EC: 1,
                DT: []
            }
        }
    } catch (error) {
        return {
            EM: "Something wrong from service!!!",
            EC: 1,
            DT: []
        }
    }
}

// --------------------------------------------------
const getAllUpcomingBookingByPatientId = async (patientId) => {
    try {
        const { count, rows } = await db.Booking.findAndCountAll({
            where: { patientId: patientId, status: 1 },
            include: [
            {
                model: db.Schedule,
                where: { date: { [Op.gte]: new Date() } },
                include: [
                    { model: db.Doctors, include: [{ model: db.User }, { model: db.Facility }] }, { model: db.Timeslot },
                ]
            },
            { model: db.Patient, include: [{ model: db.User }] }
            ],
            raw: true,
            nest: true
        });

        if (count === 0) return { EC: 0, EM: "Không tìm thấy lịch hẹn sắp tới", DT: [] };

        const groupedByDate = rows.reduce((acc, booking) => {
            const date = booking.Schedule.date.split('T')[0]; // Lấy phần ngày YYYY-MM-DD
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(booking);
            return acc;
        }, {});
        return { 
            EC: 0, 
            EM: "Lấy lịch hẹn sắp tới thành công!", 
            DT: { rows: groupedByDate } 
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn" };
    }
};

// --------------------------------------------------
const getDoctorBookingHistoryByDoctorId = async (doctorId, timeRange) => {
    try {
        const doctor = await db.Doctors.findOne({
            where: { id: doctorId }
        })
        if (!doctor) return { EC: 1, EM: "Không tìm thấy bác sĩ", DT: [] };
        const now = new Date();
        const dateFilter = {
          week: new Date(now.setDate(now.getDate() - 7)),
          month: new Date(now.setMonth(now.getMonth() - 1)),
          older: new Date(now.setFullYear(now.getFullYear() - 1)),
        }[timeRange?.toLowerCase()] || new Date(now.setDate(now.getDate() - 7)); // Mặc định tuần

        const { count, rows } = await db.Booking.findAndCountAll({
            include: [
                {
                    model: db.Schedule,
                    include: [
                    { model: db.Doctors, where: { id: doctor.id }, include: [{ model: db.User }, { model: db.Facility }] },
                    { model: db.Timeslot },
                    ],
                },
                { model: db.History },
                { model: db.Patient, include: [{ model: db.User }] },
            ],
            order: [['date', 'DESC']],
        });
        if (rows === 0) return { EC: 0, EM: "Không tìm thấy lịch sử các cuộc hẹn", DT: [] };
        return { EC: 0, EM: "Lấy lịch sử các cuộc hẹn thành công!", DT: {count, rows} };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn" };
    }
};

// --------------------------------------------------
const getAllHistoryBookingByUserId = async (userId, timeRange) => {
    try {
        const patient = await db.Patient.findOne({
            where: { userId: userId }
        })
        if (!patient) return { EC: 1, EM: "Không tìm thấy bệnh nhân", DT: [] };
        const now = new Date();
        const dateFilter = {
          week: new Date(now.setDate(now.getDate() - 7)),
          month: new Date(now.setMonth(now.getMonth() - 1)),
          older: new Date(now.setFullYear(now.getFullYear() - 1)),
        }[timeRange?.toLowerCase()] || new Date(now.setDate(now.getDate() - 7)); // Mặc định tuần

        const { count, rows } = await db.Booking.findAndCountAll({
            where: {
                patientId: patient.id,
                status: 2,
                '$History.createdAt$': { [Op.gte]: dateFilter }, // Lọc theo thời gian
            },
            include: [
                {
                    model: db.Schedule,
                    include: [
                    { model: db.Doctors, include: [{ model: db.User }, { model: db.Facility }] },
                    { model: db.Timeslot },
                    ],
                },
                { model: db.History },
                { model: db.Patient, include: [{ model: db.User }] },
            ],
            order: [[db.History, 'createdAt', 'DESC']],
            raw: true,
            nest: true,
        });
        if (rows === 0) return { EC: 0, EM: "Không tìm thấy lịch sử các cuộc hẹn", DT: [] };
        return { EC: 0, EM: "Lấy lịch sử các cuộc hẹn thành công!", DT: {count, rows} };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn" };
    }
};

// --------------------------------------------------
const getHistoryBookingByBookingId = async (bookingId) => {
    try {
        let booking = await db.Booking.findOne({
            where: { id: bookingId, status: 2 },
            include: [
                {
                    model: db.Schedule,
                    include: [
                        { model: db.Doctors, include: [{ model: db.User }, { model: db.Facility }] },
                        { model: db.Timeslot }
                    ]
                },
                { model: db.History },
                { model: db.Patient, include: [{ model: db.User }] },
            ]
        });

        if (!booking) return { EC: 1, EM: "Không tìm thấy lịch sử cuộc hẹn", DT: null };

        const rating = await db.Rating.findAll({
            where: { bookingId },
            include: [
                { model: db.Patient, include: [{ model: db.User }] }
            ]
        });

        const prescription = await db.Prescriptions.findAll({
            where: { bookingId },
            include: [{ model: db.Medicines }]
        })
        
        booking = {
            ...booking.toJSON(),
            rating: rating.map(r => ({
                ...r.toJSON(),
                name: r.Patient.User.name,
                createdAt: new Date(r.createdAt).toLocaleDateString("vi-VN")
            })),
            prescription: prescription.map(p => ({
                medicineName: p.Medicine.name,
                prescriptionsQuantity: p.quantity,
                medicineDespription: p.Medicine.description,
            })),
        };
        console.log('=====================================================================================================', booking)

        return { EC: 0, EM: "Lấy lịch sử cuộc hẹn thành công!", DT: booking };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: null };
    }
};




// ---------------------------------------------------------
const getBookingsToday = async (doctorId, date) => {
    try {
        if (!doctorId || !date) {
            throw new Error("Thiếu doctorId hoặc date");
        }
        const doctor = await db.Doctors.findOne({
            where: { userId : doctorId },
            raw: true,
            nest: true
        })

        const schedules = await db.Schedule.findAll({
            where: { doctorId: doctor.id, date }, 
            include: [
                { model: db.Timeslot },
            ],
            raw: true,
            nest: true
        });

        const bookings = await Promise.all(schedules.map(async (schedule) => {
            const scheduleBookings = await db.Booking.findAll({
                where: { scheduleId: schedule.id },
                include: [{ model: db.Patient, include: [{ model: db.User }] }],
                raw: true,
                nest: true
            });

            return {
                booking: scheduleBookings
            };
        }));

        return { EC: 0, EM: "", DT: bookings };
    } catch (error) {
        console.error("Lỗi khi lấy lịch trình:", error);
        return { schedule: null, bookings: [], error: error.message };
    }
};


// --------------------------------------------------
const getBookingTodayOfDoctor = async (userId, date) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        // 1. Tìm bác sĩ dựa trên userId
        const doctor = await db.Doctors.findOne({ where: { userId } });
        if (!doctor) {
            return {
                EC: 0,
                EM: 'Không tìm thấy bác sĩ!',
                DT: []
            };
        }

        // 2. Lấy các schedule của bác sĩ
        const schedules = await db.Schedule.findAll({
            where: { doctorId: doctor.id }
        });

        if (!schedules || schedules.length === 0) {
            return {
                EC: 0,
                EM: 'Không tìm thấy lịch làm việc nào đã được đặt hẹn của bác sĩ này!',
                DT: []
            };
        }

        // 3. Lấy danh sách scheduleId
        const scheduleIds = schedules.map(schedule => schedule.id);

        // 4. Lấy các booking phù hợp với scheduleId và date hôm nay
        const bookings = await db.Booking.findAll({
            where: {
                scheduleId: { [Op.in]: scheduleIds },
                date: {
                    [Op.gte]: new Date(date), // Lớn hơn hoặc bằng đầu ngày
                    [Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) // Nhỏ hơn ngày tiếp theo
                }
            },
            include: [
                { model: db.Schedule, include: { model: db.Timeslot } },
                { model: db.Patient, include: { model: db.User } } // Giả định có liên kết với Patient
            ]
        });

        if (!bookings || bookings.length === 0) {
            return {
                EC: 0,
                EM: 'Không tìm thấy lịch hẹn nào cho hôm nay!',
                DT: []
            };
        }

        // 5. Định dạng dữ liệu trả về
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            date: booking.date,
            status: booking.status === 1 ? 'Đã đặt rồi đó' : 
                    booking.status === -1 ? 'Hủy rồi nhe' : 
                    booking.status === 2 ? 'Đã khám xong' : 'Nó đang bị lỗi gì rồi á',
            schedule: {
                id: booking.Schedule?.id || null,
                date: booking.Schedule?.date || null,
                currentNumber: booking.Schedule?.currentNumber || 0,
                maxNumber: booking.Schedule?.maxNumber || 0,
                timeslot: {
                    id: booking.Schedule?.Timeslot?.id || null,
                    startTime: booking.Schedule?.Timeslot?.startTime || null,
                    endTime: booking.Schedule?.Timeslot?.endTime || null
                }
            },
            patient: booking.Patient ? { name: booking.Patient.User.name, id: booking.Patient.id } : null
        }));

        return {
            EC: 0,
            EM: 'Thành công lấy dữ liệu lịch hẹn hôm nay',
            DT: formattedBookings
        };
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch hẹn hôm nay:', error);
        return {
            EM: 'Đã xảy ra lỗi từ server!',
            EC: 1,
            DT: []
        };
    }
};

// --------------------------------------------------
const getBookingInfo = async (scheduleID, patientID) => {
    try {
        const schedule = await db.Schedule.findOne({
            where: { id: scheduleID },
            include: [
                { model: db.Timeslot },
                { 
                    model: db.Doctors,
                    include: [{ model: db.User }, { model: db.Facility }, { model: db.Specialty }]
                }
            ],
            raw: true,
            nest: true
        });
        const patient = await db.Patient.findOne({
            where: { userId: patientID },
            include: [{ model: db.User }],
            raw: true,
            nest: true
        });
        const doctor = await db.Doctors.findOne({
            where: { userId: patientID },
            raw: true,
            nest: true
        });
        if (doctor) {
            return { EC: 2, EM: "Bạn là bác sĩ không được đặt lịch!", DT: {} };
        }
        if (!schedule || !patient) {
            return { EC: 1, EM: "Không tìm thấy thông tin", DT: {} };
        }
        if (schedule.currentNumber >= schedule.maxNumber) {
            return { EC: 3, EM: "Lịch hẹn này đã đầy, vui lòng chọn thời gian khác", DT: {} };
        }
        return { EC: 0, EM: "", DT: { schedule, patient } };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};

// --------------------------------------------------
const getAllBooking = async () => {
    try {
        let bookings = await db.RepairBooking.findAll({
            raw: true,
            nest: true
        });
        console.log("Booking:", booking);
        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: bookings,
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};

























// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getDataForCreateBookingApiService = async (workScheduleId, userId) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            attributes: ['work_schedule_id', 'work_date', 'shift', 'max_number', 'current_number'],
            include: [{
                model: db.Technician,
                attributes: ['technician_id'],
                include: [{ 
                    model: db.Store,
                    attributes: ['store_id', 'name', 'address', 'store_image'],
                }, { 
                    model: db.User,
                    attributes: ['user_id', 'name', 'email', 'phone', 'avatar'],
                }]
            }],
            raw: true, nest: true
        });

        if (!workSchedule) {
            return { EC: 1, EM: "Không tìm thấy lịch làm việc", DT: {} };
        }

        const customer = await db.Customer.findOne({
            attributes: ['customer_id'],
            include: [{
                where: { user_id: userId },
                model: db.User,
                attributes: ['user_id', 'name', 'email', 'phone']
            }],
            raw: true, nest: true
        });

        if (!customer) {
            return { EC: 2, EM: "Không tìm thấy thông tin khách hàng! Người dùng này thuộc quyền truy cập khác.", DT: {} };
        }

        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: { workSchedule, customer }
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createBookingApiService = async ({ issueDescription, deviceType, model, brand, issueImage, workScheduleId, customerId, bookingDate, bookingTime }) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            attributes: ['current_number', 'max_number']
        });

        if (!workSchedule) {
            return { EC: 2, EM: "Không tìm thấy lịch làm việc", DT: {} };
        }

        if (workSchedule.current_number >= workSchedule.max_number) {
            return { EC: 3, EM: "Lịch đã đầy, không thể đặt thêm", DT: {} };
        }

        const repairBooking = await db.RepairBooking.create({
            issue_description: issueDescription,
            device_type: deviceType,
            model,
            brand,
            issue_image: issueImage,
            work_schedule_id: workScheduleId,
            customer_id: customerId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: 'pending'
        });

        // Sau khi tạo, tăng current_number
        if (repairBooking) {
            await db.WorkSchedule.increment('current_number', {
                by: 1,
                where: { work_schedule_id: workScheduleId }
            });

            console.log("Tạo lịch thành công:", repairBooking.booking_id);
            return { EC: 0, EM: "Tạo lịch thành công", DT: repairBooking.booking_id };
        } else {
            console.error("Không thể tạo lịch");
            return { EC: 1, EM: "Không thể tạo lịch", DT: {} };
        }
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn khi tạo lịch", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const cancelBookingApiService = async ({ bookingId, reason }) => {
    try {
        const booking = await db.RepairBooking.findOne({
            where: { booking_id: bookingId },
            include: [{ model: db.WorkSchedule, attributes: ['work_schedule_id', 'current_number'] }]
        });

        if (!booking) {
            return { EC: 2, EM: "Không tìm thấy lịch hẹn", DT: {} };
        }

        if (booking.status === 'cancelled') {
            return { EC: 3, EM: "Lịch hẹn đã bị hủy trước đó", DT: {} };
        }
        // Cập nhật trạng thái và lý do hủy
        await booking.update({
            status: 'cancelled',
            notes: reason || 'Không có lý do',
        });

        // Giảm current_number trong WorkSchedule
        await db.WorkSchedule.decrement('current_number', {
            by: 1,
            where: {
                work_schedule_id: booking.work_schedule_id,
                current_number: { [Op.gt]: 0 }
            }
        });

        // Thêm bản ghi vào repairhistory
        await db.RepairHistory.create({
            booking_id: bookingId,
            status: 'cancelled',
            notes: reason || 'Không có lý do',
            action_date: new Date(),
        });

        return { EC: 0, EM: "Hủy lịch thành công", DT: bookingId };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn khi hủy lịch", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateBookingApiService = async ({ bookingId, issueDescription, issueImage, deviceType, model, brand }) => {
	try {
		const booking = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
		});
		if (!booking) {
			return { EC: 2, EM: "Không tìm thấy lịch hẹn", DT: {} };
		}
		if (booking.status === 'cancelled') {
			return { EC: 3, EM: "Không thể cập nhật đơn đã bị hủy", DT: {} };
		}

		const updatedData = {
			device_type: deviceType || "",
			model: model || "",
			brand: brand || "",
            issue_description: issueDescription || "",
        };

        if (issueImage !== undefined) {
            updatedData.issue_image = issueImage;
        } else {
            updatedData.issue_image = booking.issue_image;
        }
        console.log("📌 Dữ liệu `updatedData` trước khi cập nhật:", updatedData);
		// await booking.update(updatedData);

        // Thêm bản ghi vào repairhistory
        await db.RepairHistory.create({
            booking_id: bookingId,
            status: 'updated',
            notes: 'Cập nhật thông tin',
            action_date: new Date(),
        });
		return { EC: 0, EM: "Cập nhật lịch thành công", DT: booking };
	} catch (error) {
		console.error("Update booking error:", error);
		return { EC: -1, EM: "Lỗi khi cập nhật lịch", DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingByIdApiService = async (bookingId) => {
    try {
        const fullBooking = await db.RepairBooking.findOne({
		where: { booking_id: bookingId },
		attributes: [
			'booking_id', 'issue_description', 'device_type', 'model', 'brand',
			'issue_image', 'booking_date', 'booking_time', 'status'
		],
		include: [
			{
				model: db.WorkSchedule,
				attributes: ['work_schedule_id', 'work_date', 'shift', 'max_number', 'current_number'],
				include: [{
					model: db.Technician,
					attributes: ['technician_id'],
					include: [
						{ model: db.Store, attributes: ['store_id', 'name', 'address', 'store_image'] },
						{ model: db.User, attributes: ['user_id', 'name', 'email', 'phone', 'avatar'] }
					]
				}]
			},
			{
				model: db.Customer,
				attributes: ['customer_id'],
				include: [
					{ model: db.User, attributes: ['user_id', 'name', 'email', 'phone'] }
				]
			},
			{
				model: db.RepairHistory,
				attributes: ['history_id', 'notes', 'action_date', 'createdAt', 'status'],
				separate: true,
				order: [['action_date', 'DESC']]
			}
		]
	});

	return fullBooking
		? { EC: 0, EM: "Lấy thông tin lịch hẹn thành công", DT: fullBooking }
		: { EC: 1, EM: "Không tìm thấy lịch hẹn", DT: {} };
    } catch (error) {
        console.error("getBookingByIdApiService error:", error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getCustomerBookingsApiService = async (userId) => {
    try {
        const customer = await db.Customer.findOne({
            where: { user_id: userId },
            raw: true, nest: true
        });
        const whereClause = { customer_id: customer.customer_id };

        const bookings = await db.RepairBooking.findAll({
            where: whereClause,
            attributes: ['booking_id', 'booking_date', 'status'],
            include: [
                {
                    model: db.WorkSchedule,
                    attributes: ['work_schedule_id', 'work_date', 'shift'],
                    include: [
                        {
                            model: db.Technician,
                            attributes: ['technician_id'],
                            include: [
                                { model: db.Store, attributes: ['store_id', 'name', 'address'] },
                                { model: db.User, attributes: ['user_id', 'name', 'email', 'phone', 'avatar'] }
                            ]
                        }
                    ]
                },
            ],
            order: [['createdAt', 'DESC']],
            raw: true, nest: true
        });

        if (!bookings || bookings.length === 0) {
            return { EC: 1, EM: "Không tìm thấy đơn đặt lịch", DT: [] };
        }

        return {
            EM: "Lấy danh sách đơn đặt lịch thành công",
            EC: 0,
            DT: bookings
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: [] };
    }
};
























// --------------------------------------------------
export default {
    createNewBooking, 
    cancelBooking, 
    completeBooking,

// --------------------------------------------------
getDataForCreateBookingApiService,
createBookingApiService,
cancelBookingApiService,
updateBookingApiService,
getBookingByIdApiService,
getCustomerBookingsApiService,
// --------------------------------------------------
    getAllBooking,
    getAllBookingByDoctorId, 
    getBookingInfo, 
    getBookingsToday, 
    getAllUpcomingBookingByPatientId, 
    getAllHistoryBookingByUserId,
    getDoctorBookingHistoryByDoctorId,
    getHistoryBookingByBookingId,

    getBookingTodayOfDoctor,
}