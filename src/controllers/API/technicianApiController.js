import e from 'connect-flash';
import technicianApiService from '../../services/API/technicianApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readFeaturedDoctors = async (req, res) => {
    try {
        const doctorData = await doctorApiService.getFeaturedDoctors();
        return res.status(200).json( doctorData );
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
};
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readDoctorDetail = async (req, res) => {
    try {
        const doctorId = req.params.id
        const data = await doctorApiService.getDoctorById(doctorId);
        return res.status(200).json( data )
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateDoctor = async (req, res) => {
    try {
        let doctorData = req.body;
        doctorData.price = parseFloat(doctorData.price.replace(/[^\d.]/g, ""));
        const data = await doctorApiService.updateDoctor(doctorData);
        return res.status(200).json( data )
    } catch (error) {
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readDoctorsBySpecialty = async (req, res) => {
    try {
        const { specialtyId, excludeDoctorId, limit } = req.query;
        const result = await doctorApiService.getDoctorsBySpecialty(specialtyId, excludeDoctorId, limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in readDoctorsBySpecialty:', error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: "-1",
            DT: []
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readPatientsOfDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const data = await doctorApiService.getPatientsOfDoctor(doctorId);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readVisitedDoctors = async (req, res) => {
    try {
        console.log("THONG BAO DA GOI DEN APICONTROLLER!")
        const patientId = req.params.patientId;
        const data = await doctorApiService.getVisitedDoctors(patientId);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readTechnicians, 
    readTechnicianDetail,
    readSimilarTechniciansApiController,
    
    readFeaturedDoctors,
    readDoctorDetail, 
    readDoctorsBySpecialty,
    readPatientsOfDoctor,
    readVisitedDoctors,

    updateDoctor
}