import workScheduleApiService from '../../services/API/workScheduleApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readWorkScheduleByTechnician = async (req, res) => {
	try {
		const technicianId = parseInt(req.params.id);
		if (!technicianId) {
			return res.status(400).json({
				EM: "Thiếu technicianId",
				EC: -1,
				DT: []
			});
		}
		const data = await workScheduleApiService.getWorkScheduleByTechnician(technicianId);
		if (data.EC !== 0) {
			return res.status(200).json({
				EM: "Không tìm thấy lịch làm việc",
				EC: 0,
				DT: []
			});
		}
		return res.status(200).json({
			EM: data.EM || "Lấy lịch làm việc thành công",
			EC: data.EC || 0,
			DT: data.DT
		});
	} catch (error) {
		console.error(`Error in readWorkScheduleByTechnician (id ${req.params.id}):`, error.message);
		return res.status(500).json({
			EM: error.message || "Internal server error",
			EC: -1,
			DT: []
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleCreateWorkScheduleForStoreManagerApiController = async (req, res) => {
	try {
		const { storeManagerId, schedules } = req.body;

		if (!storeManagerId) {
			return res.status(400).json({
				EC: -1,
				EM: "Thiếu storeManagerId",
				DT: [],
			});
		}

		if (!Array.isArray(schedules) || schedules.length === 0) {
			return res.status(400).json({
				EC: 1,
				EM: "Dữ liệu không hợp lệ",
				DT: [],
			});
		}

		for (const item of schedules) {
			if (!item.technician_id || !item.work_date || !item.shift) {
				return res.status(400).json({
					EC: 1,
					EM: "Thiếu thông tin cần thiết",
					DT: [],
				});
			}
		}

		const result = await workScheduleApiService.createWorkSchedulesByStoreManagerApiService(
			storeManagerId,
			schedules
		);

		return res.status(200).json(result);
	} catch (err) {
		console.error("Lỗi tạo lịch:", err);
		return res.status(500).json({
			EC: -1,
			EM: "Lỗi server",
			DT: [],
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readWorkScheduleByTechnician,
	handleCreateWorkScheduleForStoreManagerApiController
}