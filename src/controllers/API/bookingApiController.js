import bookingApiService from '../../services/bookingApiService';
import notificationService from '../../services/newservices/notificationApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CRUD Operations
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
        const data = await bookingApiService.getDataForCreateBookingApiService(workScheduleId, userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EM: "Lỗi server",
            EC: -1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readAllBookingForStoreManagerApiController = async (req, res) => {
    try {
        const { storeManagerId } = req.params;
        if (!storeManagerId) {
            return res.status(400).json({
                EM: "Thiếu dữ liệu",
                EC: -1,
                DT: []
            });
        }
        const data = await bookingApiService.readAllBookingsForStoreManagerApiService(storeManagerId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EM: "Lỗi server",
            EC: -1,
            DT: []
        });
    }
};
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
const cancelBookingApiController = async (req, res) => {
    try {
        const { bookingId, reason } = req.body;
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
const readCustomerBookingsApiController = async (req, res) => {
    try {
        const { userId } = req.params;
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
// Handlers
const handleReadBookingDetail = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu dữ liệu", DT: {} });
        }
        const data = await bookingApiService.getBookingInfo2(bookingId);
        if (data.EC !== 0) {
            return res.status(404).json({ EC: data.EC, EM: data.EM, DT: data.DT });
        }
        return res.status(200).json({ EC: 0, EM: data.EM, DT: data.DT });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const fuckYouApiController = async (req, res) => {
    try {
        const { repair_booking_id } = req.params;
        if (!repair_booking_id) {
            return res.status(400).json({ EC: 1, EM: "Thiếu dữ liệu", DT: {} });
        }
        const data = await bookingApiService.getRepairBookingDetailForStoreManager(repair_booking_id);
        return res.json(data);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const approveRepairBookingController = async (req, res) => {
    try {
        const { repair_booking_id } = req.body;
        if (!repair_booking_id) {
            return res.status(400).json({ EC: 1, EM: "Thiếu dữ liệu", DT: {} });
        }
        const data = await bookingApiService.approveRepairBooking(repair_booking_id);
        await notificationService.createNotification(data.DT.customer_id, `Đơn đặt lịch #${repair_booking_id} của bạn đã được duyệt!`, `/dat-lich/${repair_booking_id}/thong-tin/chi-tiet`);
        return res.json(data);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something wrong from server!",
            EC: -1,
            DT: []
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const reassignAndApproveBookingController = async (req, res) => {
	try {
		const { bookingId, workScheduleId, technicianId } = req.body;
		if (!bookingId || !workScheduleId || !technicianId) {
			return res.json({ EC: 1, EM: "Thiếu dữ liệu bắt buộc", DT: null });
		}

		const data = await bookingApiService.reassignAndApproveBooking({
			bookingId,
			workScheduleId,
			technicianId
		});

		if (data.EC === 0) {
			return res.json(data);
		} else {
			return res.json(data);
		}
	} catch (error) {
		console.error("Lỗi reassignAndApproveBookingController:", error);
		return res.json({ EC: -1, EM: "Lỗi server khi đổi kỹ thuật viên và duyệt đơn", DT: null });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Export
export default {
    readDataForCreateBookingApiController,
    readAllBookingForStoreManagerApiController,
    createBookingApiController,
    cancelBookingApiController,
    updateBookingApiController,
    readBookingByIdApiController,
    readCustomerBookingsApiController,
    handleReadBookingDetail,

    fuckYouApiController,
    approveRepairBookingController,
    reassignAndApproveBookingController
};