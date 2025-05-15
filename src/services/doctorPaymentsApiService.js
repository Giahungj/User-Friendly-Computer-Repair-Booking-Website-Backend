import db from "../models";

// ---------------------------------------------------------
const getPaymentData = async (doctorId) => {
    try {
        const payments = await db.DoctorPayments.findAll(
            { where: { doctorId: doctorId }, order: [[ 'createdAt', 'DESC' ]], raw: true, nest: true }
        );
        if (!payments) return { EM: "Cập nhật chuyên khoa của bác sĩ thành công.", EC: 0, DT: [] }
        // console.log("📌 Dữ liệu `payments` trước khi lưu:", payments);
        return { EM: "Cập nhật chuyên khoa của bác sĩ thành công.", EC: 0, DT: payments };
    } catch (error) {
        console.error("Lỗi khi cập nhật chuyên khoa của bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
const getDetailPaymentData = async (paymentId) => {
    try {
        const payment = await db.DoctorPayments.findOne({
            where: { id: paymentId },
            include: [
                { model: db.Patient, include: [{ model: db.User }] },
                { model: db.Doctors, include: [{ model: db.User }] },
                { model: db.Booking, include: [{ model: db.Schedule, include: [{ model: db.Timeslot }] }] },
            ], raw: true, nest: true 
        });
        if (!payment) return { EM: "Cập nhật chuyên khoa của bác sĩ thành công.", EC: 0, DT: [] }
        const formatedPayment = {
            id: payment.id,
            paymentAmount: Number(payment.paymentAmount).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            }),
            paymentDate: new Date(payment.paymentDate).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            paymentStatus: payment.status,
            patientName: payment.Patient.User.name,
            doctorName: payment.Doctor.User.name,
            bookingId: payment.Booking.id,
            bookingDate: new Date(payment.Booking.date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            bookingDescription: payment.Booking.description,
            timeslotStartTime: payment.Booking.Schedule.Timeslot.startTime,
            timeslotEndTime: payment.Booking.Schedule.Timeslot.endTime,
        };
          
        console.log("📌 Dữ liệu `payment` trước khi lưu:", formatedPayment);
        return { EM: "Cập nhật chuyên khoa của bác sĩ thành công.", EC: 0, DT: formatedPayment };
    } catch (error) {
        console.error("Lỗi khi cập nhật chuyên khoa của bác sĩ:", error);
        return { EM: "Đã xảy ra lỗi từ server!", EC: 1, DT: [] };
    }
};

// ---------------------------------------------------------
export default {
    getPaymentData,
    getDetailPaymentData
}