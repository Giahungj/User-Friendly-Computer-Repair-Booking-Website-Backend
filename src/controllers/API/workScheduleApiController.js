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
export default {
    readWorkScheduleByTechnician,
}