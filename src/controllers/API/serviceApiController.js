import serviceApiService from "../../services/serviceApiService";

// ---------------------------------------------------------
const readAllServices = async (req, res) => {
    try {
        const results = await serviceApiService.getAllServicesService();
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
        });
    }
};

// ---------------------------------------------------------
const registerDoctorService = async (req, res) => {
    try {
        const { doctorId, serviceId } = req.body;

        if (!doctorId || !serviceId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu thông tin doctorId hoặc serviceId", DT: null });
        }

        const result = await serviceApiService.createDoctorService(doctorId, serviceId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi đăng ký dịch vụ bác sĩ:", error);
        return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
    }
};

// ---------------------------------------------------------
const readDoctorServices = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu doctorId", DT: null });
        }

        const result = await serviceApiService.getDoctorServices(doctorId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi lấy danh sách dịch vụ bác sĩ:", error);
        return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
    }
};

// ---------------------------------------------------------
const updateDoctorService = async (req, res) => {
    try {
        const { doctorId, serviceId } = req.body;

        if (!doctorId || !serviceId) {
            return res.status(400).json({ EC: 1, EM: "Thiếu thông tin doctorId hoặc serviceId", DT: null });
        }
        const result = await serviceApiService.upgradeDoctorService(doctorId, serviceId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi đăng ký dịch vụ bác sĩ:", error);
        return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
    }
};

// ---------------------------------------------------------
export default {
    readAllServices,
    registerDoctorService,
    readDoctorServices,
    updateDoctorService
};
