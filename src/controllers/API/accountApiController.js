// controller/accountApiController.js
import accountApiService from "../../services/accountApiService";

// --------------------------------------------------
const handleResetPassword = async (req, res) => {
    try {
        const { emailOrPhone, newPassword } = req.body;
        console.log("emailOrPhone: ", emailOrPhone);    
        if (!emailOrPhone || !newPassword) {
            return res.status(400).json({ EC: 1, EM: "Vui lòng nhập mật khẩu!" });
        }
        const result = await accountApiService.resetPassword(emailOrPhone, newPassword);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ EC: -1, EM: "Lỗi server, vui lòng thử lại!" });
    }
};

// --------------------------------------------------
const handleChangePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ EC: 1, EM: "Vui lòng nhập mật khẩu!" });
        }
        const result = await accountApiService.changePassword(email, currentPassword, newPassword);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ EC: -1, EM: "Lỗi server, vui lòng thử lại!" });
    }
};

// --------------------------------------------------
const readUser = async (req, res) => {
    try {
        const email = req.params.email
        const data = await accountApiService.getUserByEmail(email);
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
export default { 
    handleResetPassword, 
    handleChangePassword, 
    readUser 
};