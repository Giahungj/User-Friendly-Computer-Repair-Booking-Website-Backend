import technicianBookingApiService from "../../services/API/technicianBookingApiService";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingListByTechnician = async (req, res) => {
	try {
		const { technicianId } = req.params;
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.bookingListOfTechnician(
			technicianId,
			startDate,
			endDate
		);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingDetailByTechnician = async (req, res) => {
	try {
		const { bookingId } = req.params;
		
		if (!bookingId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.bookingDetailOfTechnician(bookingId);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianProfile = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianProfile(technicianId);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getWorkScheduleByTechnician = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianWorkSchedules(technicianId);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianWorkScheduleDetail = async (req, res) => {
	try {
		const { scheduleId } = req.params;
		
		if (!scheduleId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianWorkScheduleDetail(scheduleId);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianRating = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianRating(technicianId);

		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleConfirmAndCompleteBooking = async (req, res) => {
	try {
		const { technicianId, bookingId } = req.body;
		if (!technicianId || !bookingId) {
			return res.json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.confirmAndCompleteBooking(bookingId);
		return res.json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getBookingListByTechnician, 
	getBookingDetailByTechnician, 
	getTechnicianProfile, 
	getWorkScheduleByTechnician,
	getTechnicianWorkScheduleDetail,
	getTechnicianRating,
	handleConfirmAndCompleteBooking
}