import { searchDoctorsService, searchSpecialtiesService, searchFacilitiesService, searchPatientsService } from "../../services/searchApiService.js";

// --------------------------------------------------
const search = async(req, res) => {
     try {
        const { keyword } = req.query;
        console.log("=======================================================================");
        console.log("🔍 Đã gọi đến tìm kiếm!");
        console.log("=======================================================================");
        console.log(`🔍 Từ khóa của bạn: ${keyword}`);
        console.log("=======================================================================");
        if (!keyword) return res.status(400).json({ message: "Query is required" });
        const results = await searchDoctorsService(keyword);
        console.log("🔍 Kết quả tìm kiếm:");
        console.log("=======================================================================");
        console.log("👨‍⚕️ Bác sĩ:", results);
        console.log("=======================================================================");
        // Trả về phản hồi cho client
        return res.status(200).json({
            EM: results.EM,
            EC: results.EC,
            DT: results.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

// --------------------------------------------------
const searchAll = async(req, res) => {
     try {
        const { keyword } = req.query;
        console.log("=======================================================================");
        console.log("Đã gọi đến tìm kiếm!");
        console.log("=======================================================================");
        console.log(`Từ khóa của bạn: ${keyword}`);
        console.log("=======================================================================");
        if (!keyword) return res.status(400).json({ message: "Query is required" });

        const doctorResult = await searchDoctorsService(keyword);
        const specialtyResult = await searchSpecialtiesService(keyword);
        const facilityResult = await searchFacilitiesService(keyword);
        console.log("🔍 Kết quả tìm kiếm:");
        console.log("=======================================================================");
        console.log("👨‍⚕️ Bác sĩ:", doctorResult);
        console.log("=======================================================================");
        console.log("🏥 Chuyên khoa:", specialtyResult);
        console.log("=======================================================================");
        console.log("🏬 Cơ sở:", facilityResult);
        console.log("=======================================================================");

        return res.status(200).json({
            EM: "",
            EC: 0,
            DT: {
                doctors: doctorResult.DT,
                specialties: specialtyResult.DT,
                facilities: facilityResult.DT
            }
        });
    } catch (error) {
        console.error('❌ Search error:', error.stack);
        return res.status(500).json({
            EM: 'Server error',
            EC: -1,
            DT: '',
        });
    }
}

// --------------------------------------------------
const searchPatients = async(req, res) => {
    try {
        const { query } = req.query;
        const { doctorId } = req.params;
        if (!query) return res.status(400).json({ message: "Query is required" });
        if (!doctorId) return res.status(400).json({ message: "Doctor ID is required" });
        const parsedDoctorId = parseInt(doctorId, 10);
       const results = await searchPatientsService(query, parsedDoctorId);
       // Trả về phản hồi cho client
       return res.status(200).json({
           EM: results.EM,
           EC: results.EC,
           DT: results.DT
       });
   } catch (error) {
       return res.status(200).json({
           EM: "Something wrong from server!",
           EC: "-1",
           DT: ""
       })
   }
}

// --------------------------------------------------
export default {
    search,
    searchAll,
    searchPatients
}