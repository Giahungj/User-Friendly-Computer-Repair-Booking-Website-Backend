// service/accountApiService.js
import { raw } from "body-parser";
import db from "../models/index"
import bcrypt from "bcryptjs";

// --------------------------------------------------
const resetPassword = async (emailOrPhone, newPassword) => {
    try {
        const user = await db.User.findOne({ 
            where: { email: emailOrPhone } 
        });
        if (!user) {
            return { EC: 1, EM: "Tài khoản không tồn tại!" };
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.User.update(
            { password: hashedPassword },
            { where: { email: emailOrPhone } }
        );
        return { EC: 0, EM: "Đặt lại mật khẩu thành công!", DT: [] };
    } catch (error) {
        console.error("Lỗi trong resetPassword:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};
// --------------------------------------------------
const changePassword = async (email, currentPassword, newPassword) => {
    try {
        const user = await db.User.findOne({ 
            where: { email: email } 
        });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return { EC: 1, EM: "Mật khẩu hiện tại không đúng!", DT: [] };
        }
        const resuilt = await resetPassword(email, newPassword)
        if (!resuilt || resuilt.EC !== 0) {
            return { EC: 1, EM: "Lỗi khi thay đổi mật khẩu!", DT: [] };
        }
        return { EC: 0, EM: "Đổi mật khẩu thành công!", DT: [] };
    } catch (error) {
        console.error("Lỗi trong changePassword:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};
// --------------------------------------------------
const getUserByEmail = async (email) => {
    try {
        const user = await db.User.findOne({ where: { email } });

        if (!user) return null;

        let include = [];
        if (user.role === 1) {
            include.push({ model: db.StoreManager });
        } else if (user.role === 2) {
            include.push({ model: db.Technician });
        } else if (user.role === 3) {
            include.push({ model: db.Customer });
        }

        const userWithInclude = await db.User.findOne({
            where: { email },
            attributes: { exclude: ["password"] },
            include
        });

        if (!userWithInclude) {
            return { EC: 1, EM: "Không tìm thấy người dùng!", DT: [] };``
        }
        return { EC: 0, EM: "Lấy thông tin người dùng thành công!", DT: userWithInclude };
    } catch (error) {
        console.error("Lỗi trong getUserByEmail:", error);
        return { EC: -1, EM: "Có lỗi xảy ra, vui lòng thử lại!", DT: [] };
    }
};
// --------------------------------------------------
export default { 
    resetPassword, 
    changePassword, 
    getUserByEmail 
};