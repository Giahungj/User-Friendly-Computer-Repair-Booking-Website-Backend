import technicianApiService from '../../services/API/technicianApiService';
import specialtyApiService from '../../services/API/specialtyApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTechnicians = async (req, res) => {
    try {
        const data = await technicianApiService.getAllTechnicians();
        if (!data || !data.DT || !data.DT.technicians || data.DT.technicians.length === 0) {
            return res.status(200).json({
                EM: "No technicians found",
                EC: "0",
                DT: [],
            });
        }
        return res.status(200).json({
            EM: data.EM || "Get technicians successfully",
            EC: data.EC || "0",
            DT: data.DT.technicians,
        });
    } catch (error) {
        console.error(`Error in readTechnicians:`, error.message);
        return res.status(500).json({
            EM: error.message || "Internal server error",
            EC: "-1",
            DT: [],
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTechnicianDetail = async (req, res) => {
	try {
		const technicianId = parseInt(req.params.id);
		if (!technicianId) {
			return res.status(400).json({
				EM: "Thiếu technicianId",
				EC: "-1",
				DT: {}
			});
		}
		const data = await technicianApiService.getTechnicianById(technicianId);
		if (!data || !data.DT) {
			return res.status(200).json({
				EM: "Không tìm thấy kỹ thuật viên",
				EC: "0",
				DT: {}
			});
		}
		return res.status(200).json({
			EM: data.EM || "Lấy thông tin kỹ thuật viên thành công",
			EC: data.EC || 0,
			DT: data.DT
		});
	} catch (error) {
		console.error(`Error in readTechnicianDetail (id ${req.params.id}):`, error.message);
		return res.status(500).json({
			EM: error.message || "Internal server error",
			EC: -1,
			DT: {}
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readSimilarTechniciansApiController = async (req, res) => {
    try {
        const technicianId = parseInt(req.params.technicianId);
        if (!technicianId) {
			return res.status(400).json({
				EM: "Thiếu technicianId",
				EC: -1,
				DT: []
			});
		}
        const similarTechnicians = await technicianApiService.getSimilarTechniciansApiSerrvice(technicianId)
        return res.status(200).json(similarTechnicians);
    } catch (error) {
        console.error('Lỗi khi lấy kỹ thuật viên tương tự:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server', DT: [] });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTechnicianSchedulesForStoreManagerApiController = async (req, res) => {
    try {
        const data = await technicianApiService.getTechnicianSchedulesForStoreManagerApiService();
        if (!data || data.DT.length === 0) {
            return res.status(200).json({
                EM: "Không tìm thấy lịch làm việc của kỹ thuật viên",
                EC: "0",
                DT: []
            });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error("Lỗi trong readTechnicianSchedulesForStoreManager:", error.message);
        return res.status(500).json({
            EM: error.message || "Lỗi máy chủ",
            EC: "-1",
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readAvailableTechniciansForStoreManagerApiController = async (req, res) => {
    try {
        const storeManagerId = parseInt(req.params.storeManagerId);
        if (!storeManagerId) {
            return res.status(400).json({
                EM: "Thiếu storeManagerId",
                EC: "-1",
                DT: []
            });
        }
        const data = await technicianApiService.getAvailableTechniciansForStoreManagerApiService(storeManagerId);
        if (!data || data.DT.length === 0) {
            return res.status(200).json({
                EM: "Không tìm thấy lịch làm việc của kỹ thuật viên",
                EC: "0",
                DT: []
            });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error("Lỗi trong readTechnicianSchedulesForStoreManager:", error.message);
        return res.status(500).json({
            EM: error.message || "Lỗi máy chủ",
            EC: "-1",
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readAllTechniciansForStoreManagerApiController = async (req, res) => {
    try {
        const storeManagerId = parseInt(req.params.storeManagerId);
        if (!storeManagerId) {
            return res.status(400).json({
                EM: "Thiếu storeManagerId",
                EC: "-1",
                DT: []
            });
        }
        const techData = await technicianApiService.getAllTechniciansForStoreManagerApiService(storeManagerId);
        const specData = await specialtyApiService.getAllSpecialties();
        if (!techData || techData.DT.length === 0) {
            return res.status(200).json({
                EM: "Không tìm thấy danh sách của kỹ thuật viên",
                EC: "0",
                DT: []
            });
        }
        return res.status(200).json({techData, specData});
    } catch (error) {
        console.error("Lỗi trong readTechnicianSchedulesForStoreManager:", error.message);
        return res.status(500).json({
            EM: error.message || "Lỗi máy chủ",
            EC: "-1",
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleCreateTechnicianForStoreManagerApiController = async (req, res) => {
	try {
		const storeManagerId = parseInt(req.params.storeManagerId);
        if (!storeManagerId) {
            return res.status(400).json({
                EM: "Thiếu storeManagerId",
                EC: "-1",
                DT: {}
            });
        }

        const { name, email, phone, password, storeId, specialties } = req.body;
        const avatar = req.file?.filename || null;

        const requiredFields = { name, email, phone, password, storeId, avatar };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || (typeof value === "string" && !value.trim())) {
                return res.status(400).json({
                    EM: `Thiếu ${key}`,
                    EC: "-1",
                    DT: {}
                });
            }
        }

        if (!Array.isArray(specialties) || specialties.length === 0) {
            return res.status(400).json({
                EM: "Thiếu specialties",
                EC: "-1",
                DT: {}
            });
        }

		const payload = {
            storeManagerId,
            storeId,
            name,
            email,
            phone,
            password,
            avatar, // đã lấy req.file.filename
            specialties: Array.isArray(specialties) ? specialties : specialties ? [specialties] : []
        };

        const data = await technicianApiService.createTechnicianForStoreManagerApiService(payload);

		return res.status(200).json(data);
	} catch (error) {
		console.error("createTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: "-1", DT: {} });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleUpdateTechnicianForStoreManagerApiController = async (req, res) => {
	try {
		console.log("==== [DEBUG] Update Technician ====");
		const storeManagerId = parseInt(req.params.storeManagerId);
		const technicianId  = parseInt(req.params.technicianId);

		console.log("storeManagerId:", storeManagerId);
		console.log("technicianId:", technicianId);
		console.log("Body nhận được:", req.body);

		if (!storeManagerId || !technicianId) {
			return res.status(400).json({ EM: "Thiếu storeManagerId hoặc technicianId", EC: -1, DT: {} });
		}

		// Chuẩn hóa payload từ body
		const { User, Specialties } = req.body;

		const payload = {
			name: User?.name || null,
			email: User?.email || null,
			phone: User?.phone || null,
			avatar: User?.avatar || null,
			specialties: Array.isArray(Specialties) 
				? Specialties.map(sp => sp.specialty_id) 
				: []
		};

		console.log("Payload chuẩn hóa:", payload);

		// TODO: gọi service thực hiện update
		const data = await technicianApiService.updateTechnicianForStoreManagerApiService({
			storeManagerId, technicianId, ...payload
		});

		return res.status(200).json(data);
	} catch (error) {
		console.error("updateTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: -1, DT: {} });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readTechnicians, 
    readTechnicianDetail,
    readSimilarTechniciansApiController,
    readAvailableTechniciansForStoreManagerApiController,
    readAllTechniciansForStoreManagerApiController,
    
    readTechnicianSchedulesForStoreManagerApiController,

    handleCreateTechnicianForStoreManagerApiController,
    handleCreateTechnicianForStoreManagerApiController,
    handleUpdateTechnicianForStoreManagerApiController,
}