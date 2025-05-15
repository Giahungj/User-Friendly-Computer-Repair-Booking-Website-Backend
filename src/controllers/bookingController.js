import db from '../models/index';
import formatUtils from '../utils/formatUtil';
import bookingService from '../services/bookingService';

// --------------------------------------------------
const renderManagerBookingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1);
        const date = req.query.date || '';
        const timeslot = req.query.timeslot || '';
        const status = req.query.status || '';
        const searchTerm = req.query.searchTerm || '';

        const data = await bookingService.getAllBookings(page, date, timeslot, status, searchTerm);

        return res.render('layouts/layout', {
            page: `pages/bookings/managerBookingPage.ejs`,
            pageTitle: 'Quản lý đặt lịch',
            bookings: data.DT.bookingData,
            currentPage: page,
            timeSlots: data.DT.timeSlots,
            totalPages: data.DT.totalPages,
            totalBooking: data.DT.total,
            todayBookings: data.DT.todayBookings,
            confirmBookings: data.DT.confirmBookings,
        })
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const renderBookingDetailPage = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await db.Booking.findOne({
            where: { id: bookingId },
            include: [
                { model: db.History, required: false },
                {
                    model: db.Patient,
                    include: [{ model: db.User }]
                },
                {
                    model: db.Schedule,
                    include: [
                        { model: db.Doctors, include: [{ model: db.User }, { model: db.Specialty }, { model: db.Facility }] },
                        { model: db.Timeslot }
                    ]
                }
            ],
            raw: true,
            nest: true
        });

        // Cập nhật status nếu specialty bị xóa
        if (booking.Schedule?.Doctor?.Specialty?.deleted === 1) {
            await db.Booking.update(
                { status: 0 },
                { where: { id: bookingId } }
            );
        }

        // Lấy danh sách prescriptions
        const prescriptions = await db.Prescriptions.findAll({
            where: { bookingId: bookingId },
            attributes: ['id', 'quantity'],
            include: [{ model: db.Medicines, attributes: ['id', 'name'] }],
            raw: true,
            nest: true
        });

        // Tạo bookingData, chỉ thêm History nếu tồn tại
        const bookingData = {
            ...booking,
            Prescriptions: prescriptions,
            date: formatUtils.formatDate(booking.date),
            price: formatUtils.formatCurrency(booking.Schedule.Doctor.price),
            createdAt: formatUtils.formatDate(booking.createdAt),
            updatedAt: formatUtils.formatDate(booking.updatedAt),
            shift: booking.Schedule.Timeslot.shift === 1 ? 'Ca sáng' : booking.Schedule.Timeslot.shift === 2 ? 'Ca chiều' : 'Ca tối',
            // Chỉ thêm History nếu booking.History.id tồn tại
            ...(booking.History.id ? { History: booking.History } : {})
        };

        console.log(bookingData);

        return res.render('layouts/layout', {
            page: `pages/bookings/bookingDetail.ejs`,
            pageTitle: 'Chi tiết lịch hẹn',
            booking: bookingData
        });
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const approveBooking = async (req, res) => {
    try {
        const { bookingId } = await req.body
        const bookingUpdated = await db.Booking.update(
            {
                status: 'Đã duyệt'
            },
            {
                where: { id: bookingId },
                raw: true,
                nest: true
            }
        )

        return res.redirect(`/booking-detail/${bookingId}`)
    } catch (error) {
        console.error(error)
    }
}

// --------------------------------------------------
const rejectBooking = async (req, res) => {
    try {
        const { bookingId } = await req.body
        const bookingUpdated = await db.Booking.update(
            {
                status: 'Hủy'
            },
            {
                where: { id: bookingId },
                raw: true,
                nest: true
            }
        )

        return res.redirect(`/booking-detail/${bookingId}`)
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
export default {
    renderManagerBookingPage,
    renderBookingDetailPage,

    approveBooking,
    rejectBooking
}