import { time } from 'console';
import statsApiService from '../../services/statsApiService';
import { formatDate } from '../../utils/formatUtil';

// --------------------------------------------------
const readDoctorBookingStats = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await statsApiService.getDoctorBookingStats(doctorId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: -1,
            DT: []
        });
    }
};

// --------------------------------------------------
const readDoctorPatientStats = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await statsApiService.getDoctorPatientStats(doctorId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: -1,
            DT: []
        });
    }
};

// --------------------------------------------------
const readDoctorRevenueStats = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await statsApiService.getDoctorRevenueStats(doctorId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            EM: "Something went wrong on the server!",
            EC: -1,
            DT: []
        });
    }
};

// --------------------------------------------------
export default {
    readDoctorBookingStats,
    readDoctorPatientStats,
    readDoctorRevenueStats,
}