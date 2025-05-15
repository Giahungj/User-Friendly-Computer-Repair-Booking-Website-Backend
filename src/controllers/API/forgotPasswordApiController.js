// controller/AuthController.js
import forgotPasswordApiService from "../../services/forgotPasswordApiService";

// --------------------------------------------------
const handleForgotPassword = async (req, res) => {
    try {
        const { emailOrPhone, type } = req.body;
        if (!emailOrPhone || !type) {
            return res.status(400).json({ EC: 1, EM: "Vui lòng nhập email hoặc số điện thoại!" });
        }
        if (type === "email" ) {
            const result = await forgotPasswordApiService.sendOTPToEmail(emailOrPhone, type);
            return res.status(200).json(result);
        } else {
            const result = await forgotPasswordApiService.sendOTPToSMS(emailOrPhone, type);
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ EC: -1, EM: "Lỗi server, vui lòng thử lại!" });
    }
};

// --------------------------------------------------
const handleVerifyOTP = async (req, res) => {
    try {
        const { emailOrPhone, otp } = req.body;
        const result = await forgotPasswordApiService.verifyOTP(emailOrPhone, otp);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        return res.json({ EC: -1, EM: "Lỗi hệ thống, thử lại sau!" });
    }
};

// --------------------------------------------------
export default { handleForgotPassword, handleVerifyOTP };