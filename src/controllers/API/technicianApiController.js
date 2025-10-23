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
const readTechnicianSchedulesForStoreManagerApiController = async (req, res) => {
    try {
        const storeManagerId = parseInt(req.params.storeManagerId);
        const data = await technicianApiService.getTechnicianSchedulesForStoreManagerApiService(storeManagerId);
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

        console.log("Payload chuẩn bị tạo kỹ thuật viên:", payload);

        const data = await technicianApiService.createTechnicianForStoreManagerApiService(payload);

		return res.json(data);
	} catch (error) {
		console.error("createTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: "-1", DT: {} });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleUpdateTechnicianBasicInfoForStoreManager = async (req, res) => {
	try {
		const storeManagerId = parseInt(req.params.storeManagerId);
		const technicianId  = parseInt(req.params.technicianId);

		if (!storeManagerId || !technicianId) {
			return res.status(400).json({ EM: "Đây không phải chức năng bạn có thể sử dụng!", EC: -1, DT: {} });
		}

        const data = await technicianApiService.updateTechnicianBasicInfoForStoreManager({
            storeManagerId: storeManagerId,
            technicianId: technicianId,
            payload: req.body
        });
		return res.status(200).json(data);
	} catch (error) {
		console.error("updateTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: -1, DT: {} });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleUpdateTechnicianSpecialtiesForStoreManager = async (req, res) => {
	try {
		console.log("==== [DEBUG] Update Technician ====");
		const storeManagerId = parseInt(req.params.storeManagerId);
		const technicianId  = parseInt(req.params.technicianId);

		if (!storeManagerId || !technicianId) {
			return res.status(200).json({ EM: "Đây không phải chức năng bạn có thể sử dụng!", EC: -1, DT: {} });
		}

		console.log("storeManagerId:", storeManagerId);
        console.log("technicianId:", technicianId);
        console.log("Body nhận được:", req.body);

        const specialties = req.body?.specialties || [];

        if (specialties.length === 0) {
            return res.status(200).json({
                EM: "Danh sách chuyên môn không được để trống.",
                EC: 1,
                DT: {}
            });
        }

        if (specialties.length > 5) {
            return res.status(200).json({
                EM: "Một kỹ thuật viên không thể có quá 5 chuyên môn.",
                EC: 1,
                DT: {}
            });
        }

		const data = await technicianApiService.updateTechnicianSpecialtiesForStoreManager({
			storeManagerId: storeManagerId,
            technicianId: technicianId,
            specialties: specialties
		});

		return res.status(200).json(data);
	} catch (error) {
		console.error("updateTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: -1, DT: {} });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleTechnicianTransferRequestByStoreManager = async (req, res) => {
	try {
		console.log("==== [DEBUG] Update Technician ====");
		const storeManagerId = parseInt(req.params.storeManagerId);
		const technicianId  = parseInt(req.params.technicianId);

		console.log("storeManagerId:", storeManagerId);
		console.log("technicianId:", technicianId);
		console.log("Body nhận được:", req.body);

		if (!storeManagerId || !technicianId) {
			return res.status(200).json({ EM: "Thiếu storeManagerId hoặc technicianId", EC: -1, DT: {} });
		}

        const transferRequestData = req.body || {};
		if (!transferRequestData) {
			return res.status(200).json({ EM: "Không có nội dung của yêu cầu", EC: -1, DT: {} });
		}
		const data = await technicianApiService.craeteTechnicianTransferRequestByStoreManager({
			storeManagerId: storeManagerId,
            technicianId: technicianId,
            transferRequestData: transferRequestData
		});

		return res.status(200).json(data);
	} catch (error) {
		console.error("updateTechnicianForStoreManager error:", error.message);
		return res.status(500).json({ EM: error.message || "Lỗi máy chủ", EC: -1, DT: {} });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readTechnicians, 
    readTechnicianDetail,
    readSimilarTechniciansApiController,
    readAvailableTechniciansForStoreManagerApiController,
    readAllTechniciansForStoreManagerApiController,
    
    readTechnicianSchedulesForStoreManagerApiController,

    handleCreateTechnicianForStoreManagerApiController,
    handleUpdateTechnicianBasicInfoForStoreManager,
    handleUpdateTechnicianSpecialtiesForStoreManager,
    handleTechnicianTransferRequestByStoreManager,
}