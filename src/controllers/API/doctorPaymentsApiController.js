import doctorPaymentsApiService from '../../services/doctorPaymentsApiService';

// --------------------------------------------------
const readPaymentByDoctorId = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const data = await doctorPaymentsApiService.getPaymentData(doctorId);
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
const readDetailPaymentByPaymentId = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const data = await doctorPaymentsApiService.getDetailPaymentData(paymentId);
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
    readPaymentByDoctorId,
    readDetailPaymentByPaymentId
}