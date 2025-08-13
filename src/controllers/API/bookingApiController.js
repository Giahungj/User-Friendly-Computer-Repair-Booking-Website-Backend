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






























// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readDataForCreateBookingApiController = async (req, res) => {
    try {
        const { workScheduleId, userId } = req.params;
        if (!workScheduleId || !userId) {
			return res.status(400).json({
				EM: "Thiếu dữ liệu",
				EC: -1,
				DT: []
			});
		}
        const data = await bookingApiService.getDataForCreateBookingApiService(workScheduleId, userId)
        if (data) {
            return res.status(200).json(data)
        }
    } catch (error) {
        return res.status(500).json({
            EM: "hehe",
            EC: -1,
            DT: []
        })
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createBookingApiController = async (req, res) => {
    try {
        const {
            issueDescription,
            deviceType,
            model,
            brand,
            workScheduleId,
            customerId,
            bookingDate,
            bookingTime
        } = req.body;
        const issueImage = req.file ? `/uploads/${req.file.filename}` : null;
        if (!workScheduleId || !customerId) {
            return res.status(400).json({
                EM: "Thiếu dữ liệu bắt buộc",
                EC: -1,
                DT: []
            });
        }
        const data = await bookingApiService.createBookingApiService({
            issueDescription,
            deviceType,
            model,
            brand,
            issueImage,
            workScheduleId,
            customerId,
            bookingDate,
            bookingTime
        });
        return res.status(200).json(data);
    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: -1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const cancelBookingApiController = async (req, res) => {
    try {
        if (!bookingId) {
            return res.status(400).json({
                EM: "Thiếu bookingId để hủy lịch",
                EC: -1,
                DT: []
            });
        }

        const data = await bookingApiService.cancelBookingApiService({
            bookingId,
            reason
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error("Cancel booking error:", error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: -1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateBookingApiController = async (req, res) => {
	try {
		const { bookingId } = req.params;
		if (!bookingId) {
			return res.status(400).json({
				EM: "Thiếu bookingId để cập nhật lịch",
				EC: -1,
				DT: []
			});
		}
        const issueImage = req.file ? `/uploads/${req.file.filename}` : null;
		const deviceType = req.body.deviceType?.trim() || "";
		const model = req.body.model?.trim() || "";
		const brand = req.body.brand?.trim() || "";
		const issueDescription = req.body.issueDescription?.trim() || "";
		const data = await bookingApiService.updateBookingApiService({
			bookingId,
            issueDescription,
			issueImage,
			deviceType,
			model,
			brand,
		});
		return res.status(200).json(data);
	} catch (error) {
		console.error("Update booking error:", error);
		return res.status(500).json({
			EM: "Lỗi server",
			EC: -1,
			DT: []
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readBookingByIdApiController = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return res.status(400).json({
                EM: "Thiếu bookingId",
                EC: -1,
                DT: []
            });
        }
        const data = await bookingApiService.getBookingByIdApiService(bookingId);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Get booking by ID error:", error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: 1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readCustomerBookingsApiController = async (req, res) => {
    try {
        const { userId }= req.params;
        if (!userId) {
            return res.status(400).json({ EM: "Thiếu userId", EC: -1, DT: [] });
        }
        const data = await bookingApiService.getCustomerBookingsApiService(userId);

        return res.status(200).json(data);
    } catch (error) {
        console.error("Get customer bookings error:", error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: 1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------





























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

// --------------------------------------------------
    readDataForCreateBookingApiController,
    createBookingApiController,
    cancelBookingApiController,
    updateBookingApiController,
    readBookingByIdApiController,

    readCustomerBookingsApiController,
// --------------------------------------------------

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