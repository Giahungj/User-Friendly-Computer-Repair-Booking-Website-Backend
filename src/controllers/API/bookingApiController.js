import bookingApiService from '../../services/bookingApiService';
import { formatDate } from '../../utils/formatUtil';

// --------------------------------------------------
const processCreateBooking = async (req, res) => {
    try {
        let bookingData = req.body;
        if (!bookingData.scheduleID || !bookingData.patientID || !bookingData.date) {
            return res.status(400).json({ EC: 1, EM: "Thiếu dữ liệu!", DT: {} });
        }
        let data = await bookingApiService.createNewBooking(bookingData.scheduleID, bookingData.patientID, bookingData.date, bookingData.description);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: ""
        });
    }
};

// --------------------------------------------------
const handleCancelBookingById = async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu bookingId!", DT: {} });
        }
        const resuilt = await bookingApiService.cancelBooking(bookingId);
        return res.status(200).json({
            EM: resuilt.EM,
            EC: resuilt.EC,
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
};

// --------------------------------------------------
const createCompleteBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        const data = await bookingApiService.completeBooking(bookingData);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: null
        });
    }
};

// --------------------------------------------------
const readBooking = async (req, res) => {
    try {
        let data = await bookingApiService.getAllBookingByDoctorId(req.params.id)
        if (data) {
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: 1,
            DT: []
        })
    }
}

// --------------------------------------------------
const getBookingDetails = async (req, res) => {
    try {
        const { scheduleID, patientID } = req.query;
        if (!scheduleID || !patientID) {
            return res.status(400).json({ EC: 1, EM: "Thiếu scheduleID hoặc patientID", DT: {} });
        }
        const data = await bookingApiService.getBookingInfo(scheduleID, patientID);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        })
    }
};

// --------------------------------------------------
const readUpcomingBookings = async (req, res) => {
    try {
        const { patientId } = req.params;
        const data = await bookingApiService.getAllUpcomingBookingByPatientId(patientId)
        if (data) {
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        })
    }
}

// --------------------------------------------------
const readHistoryBookingsOfPatient = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeRange = "week" } = req.query;
        const data = await bookingApiService.getAllHistoryBookingByUserId(userId, timeRange)
        if (data) {
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: 1,
            DT: []
        })
    }
}

// --------------------------------------------------
const readBookingHistoryOfDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { timeRange = "week" } = req.query;
        const data = await bookingApiService.getDoctorBookingHistoryByDoctorId(doctorId, timeRange)
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: 1,
            DT: []
        })
    }
}

// --------------------------------------------------
const readHistoryBookingDetailOfPatient = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const data = await bookingApiService.getHistoryBookingByBookingId(bookingId)
        if (data) {
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }
    } catch (error) {
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: 1,
            DT: []
        })
    }
}

// --------------------------------------------------
const handleReadBookingDetail = async (req, res) => {
    try {
        const { bookingId } = req.params
        if (!bookingId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu dữ liệu", DT: {} });
        }
        const data = await bookingApiService.getBookingInfo2(bookingId);
        if (data.EC !== 0) {
            return res.status(404).json({EC: data.EC, EM: data.EM, DT: data.DT});
        }
        // console.log(data.DT)
        return res.status(200).json({EC: 0, EM: data.EM, DT: data.DT});
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        })
    }
};

// --------------------------------------------------
const readBookingsToday = async (req, res) => {
    try {
        const userId = req.params.userId;
        const date = req.query.date;

        if (!userId || !date) {
            return res.status(400).json({ EM: "Thiếu thông tin 1", EC: 1, DT: [] });
        }

        const data = await bookingApiService.getBookingsToday(userId, date);

        return res.status(200).json({data});
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const readBookingsTodayOfDoctorByDoctorId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.query; 

        if (!date) {
            return res.status(400).json({
                EM: 'Date parameter is required',
                EC: '-1',
                DT: []
            });
        }
        const result = await bookingApiService.getBookingTodayOfDoctor(userId, date);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in readDoctorBookingsTodayByDoctorId:', error);
        return res.status(500).json({
            EM: 'Something went wrong on the server!',
            EC: '-1',
            DT: []
        });
    }
};

// --------------------------------------------------
export default {
    // CRUD Operations
    readBooking,
    getBookingDetails,
    readBookingsTodayOfDoctorByDoctorId,
    processCreateBooking,
    handleCancelBookingById,
    createCompleteBooking,

    // Handlers
    handleReadBookingDetail,

    readUpcomingBookings,
    readBookingsToday,
    readHistoryBookingsOfPatient,
    readBookingHistoryOfDoctor,
    readHistoryBookingDetailOfPatient,
}