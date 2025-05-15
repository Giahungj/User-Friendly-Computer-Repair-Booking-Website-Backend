import doctorApiService from '../../services/doctorApiService';

// --------------------------------------------------
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

// --------------------------------------------------
const readDoctors = async (req, res) => {
    try {
        const data = await doctorApiService.getAllDoctor();
        return res.status(200).json({data})
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: []
        })
    }

}

// --------------------------------------------------
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

// --------------------------------------------------
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

// --------------------------------------------------
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

// --------------------------------------------------
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

// --------------------------------------------------
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

// --------------------------------------------------
export default {
    readFeaturedDoctors,
    readDoctors, 
    readDoctorDetail, 
    readDoctorsBySpecialty,
    readPatientsOfDoctor,
    readVisitedDoctors,

    updateDoctor
}