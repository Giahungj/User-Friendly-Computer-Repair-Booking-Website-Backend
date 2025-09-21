import statisticsApiService from '../../services/API/statisticApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Lấy dữ liệu xu hướng lịch hẹn cho cửa hàng trưởng
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingsTrendData = async (req, res) => {
	try {
		const { startDate, endDate, periodType, technicianId } = req.query;
		const { storeManagerId } = req.params;

		const result = await statisticsApiService.lineChart(
			storeManagerId,
			startDate,
			endDate,
			periodType,
			technicianId
		);

		return res.status(200).json(result);
	} catch (error) {
		console.error("getBookingsTrendData error:", error);
		return res.status(500).json({ EC: -1, EM: "Lỗi máy chủ", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingSummary = async (req, res) => {
	try {
		const storeManagerId = parseInt(req.params.storeManagerId);
		if (!storeManagerId) {
			return res.status(400).json({ EM: "Thiếu storeManagerId", EC: -1, DT: {} });
		}

		const { startDate, endDate, technicianId } = req.query;
		const data = await statisticsApiService.bookingsSummary(storeManagerId, startDate, endDate, technicianId);
		const total = await statisticsApiService.totalBookings(storeManagerId, startDate, endDate, technicianId);

		if (!data || !data.DT || data.DT.length === 0) {
			return res.status(200).json({
				EM: "Không tìm thấy dữ liệu lịch hẹn",
				EC: 0,
				DT: []
			});
		}

		return res.status(200).json({data, total});
	} catch (error) {
		console.error("getAppointmentsSummaryForStoreManager error:", error.message);
		return res.status(500).json({
			EM: error.message || "Lỗi máy chủ",
			EC: -1,
			DT: []
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingList = async (req, res) => {
	try {
		const storeManagerId = parseInt(req.params.storeManagerId);
		if (!storeManagerId) {
			return res.status(400).json({ EM: "Thiếu storeManagerId", EC: -1, DT: {} });
		}

		const { startDate, endDate, technicianId } = req.query;
		const data = await statisticsApiService.bookingsList(storeManagerId, startDate, endDate, technicianId);

		if (!data || !data.DT || data.DT.length === 0) {
			return res.status(200).json({
				EM: "Không tìm thấy dữ liệu lịch hẹn",
				EC: 0,
				DT: []
			});
		}

		return res.status(200).json(data);
	} catch (err) {
		console.error("getBookingList error:", err);
		return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getBookingList,
    getBookingsTrendData,
	getBookingSummary
}