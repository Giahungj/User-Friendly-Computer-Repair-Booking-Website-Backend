import specialtyApiService from '../../services/specialtyApiService';

// --------------------------------------------------
const readSpecialties = async (req, res) => {
    try {
        let data = await specialtyApiService.getSpecialtyList();
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

// --------------------------------------------------
const readSpecialtyDetail = async (req, res) => {
    try {
        const specialtyId = req.params.id;
        let data = await specialtyApiService.getSpecialtyById(specialtyId)
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        });
    }
};

// --------------------------------------------------
const updateSpecialty = async (req, res) => {
    try {
        const fieldData = req.body;
        let data = await specialtyApiService.updateSpecialty(fieldData);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

// --------------------------------------------------
const createSpecialty = async (req, res) => {
    try {
        const fieldData = req.body;
        const existingSpecialty = await db.Specialty.findOne({
            where: {
                name: fieldData.specialtyName
            }
        });
        if (existingSpecialty) {
            return res.status(200).json({
                EM: "Tên chuyên khoa đã tồn tại. Vui lòng chọn tên khác.",
                EC: "1",
                DT: ""
            });
        }
        let data = await specialtyApiService.createSpecialty(fieldData);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

// --------------------------------------------------
const readDoctorDetail = async (req, res) => {
    try {
        let doctorId = req.params.id
        let data = await doctorApiService.getDoctorDetail(doctorId);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }

}

// --------------------------------------------------
const processAddDoctorsToSpecialty = async (specialtyId, doctorIds) => {
    try {
        // Chuyển đổi ID về dạng số nguyên
        let formattedSpecialtyId = parseInt(specialtyId);
        let formattedDoctorIds = doctorIds.map(id => parseInt(id)).filter(id => !isNaN(id));

        if (isNaN(formattedSpecialtyId) || formattedDoctorIds.length === 0) {
            return {
                EM: "Dữ liệu không hợp lệ sau khi chuẩn hóa.",
                EC: -1,
                DT: {}
            };
        }
        let result = await specialtyApiService.addDoctorsToSpecialtyInDB(formattedSpecialtyId, formattedDoctorIds);
        return result;
    } catch (error) {
        console.error("Lỗi trong API Controller khi thêm bác sĩ vào chuyên khoa:", error);
        return {
            EM: "Lỗi xử lý API Controller!",
            EC: -1,
            DT: {}
        };
    }
};

// ---------------------------------------------------------
const deleteSpecialty = async (req, res) => {
    try {
        const specialtyId = req.body.specialtyId;
        let data = await specialtyApiService.deleteSpecialty(specialtyId);
        
        // Trả về phản hồi cho client
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        });
    }
}

// ---------------------------------------------------------
const restoreSpecialty = async (req, res) => {
    try {
        const specialtyId = req.body.specialtyId;
        let data = await specialtyApiService.restoreSpecialty(specialtyId);
        
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        });
    }
}

// --------------------------------------------------
export default {
    readDoctorDetail,
    processAddDoctorsToSpecialty, 
    readSpecialties,
    readSpecialtyDetail
}