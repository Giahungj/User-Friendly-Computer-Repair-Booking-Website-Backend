import technicianBookingApiService from "../../services/API/technicianBookingApiService";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingListByTechnician = async (req, res) => {
	try {
		const { technicianId } = req.params;
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.bookingListOfTechnician(
			technicianId,
			startDate,
			endDate
		);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingDetailByTechnician = async (req, res) => {
	try {
		const { bookingId } = req.params;
		
		if (!bookingId) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.bookingDetailOfTechnician(bookingId);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianProfile = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianProfile(technicianId);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getWorkScheduleByTechnician = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianWorkSchedules(technicianId);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianWorkScheduleDetail = async (req, res) => {
	try {
		const { scheduleId } = req.params;
		
		if (!scheduleId) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianWorkScheduleDetail(scheduleId);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianRating = async (req, res) => {
	try {
		const { technicianId } = req.params;
		
		if (!technicianId) {
			return res.status(400).json({ EC: -1, EM: "Thiếu tham số", DT: [] });
		}
		const result = await technicianBookingApiService.technicianRating(technicianId);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getTechnicianWorkSchedules error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
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
}