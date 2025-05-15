// service/AuthService.js
import { raw } from "body-parser";
import db from "../models/index"
import nodemailer from "nodemailer";

// --------------------------------------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password) 
    },
});

// --------------------------------------------------
const sendOTPToEmail = async (emailOrPhone, type) => {
    const user = await db.User.findOne({ where: { email: emailOrPhone } });
    if (!user) {
        return { EC: 1, EM: "Tài khoản không tồn tại!" };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.OTP.create({
        emailOrPhone,
        type,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });
    console.log(`OTP cho ${emailOrPhone}: ${otp}`); // Debug
    const mailOptions = {
        from: process.env.EMAIL_USER, // Email gửi đi
        to: emailOrPhone,
        subject: "Mã xác thực OTP của bạn",
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    };
    try {
        await transporter.sendMail(mailOptions);
        return { EC: 0, EM: "Mã OTP đã được gửi qua email!", DT: [] };
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        return { EC: -1, EM: "Không thể gửi email. Vui lòng thử lại sau!", DT: [] };
    }
};

// --------------------------------------------------
const sendOTPToSMS = async (emailOrPhone, type) => {
    // Kiểm tra email/số điện thoại có tồn tại trong hệ thống không
    const user = await db.User.findOne({ where: { email: emailOrPhone } });
    if (!user) {
        return { EC: 1, EM: "Tài khoản không tồn tại!" };
    }

    // Sinh OTP và lưu vào DB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.OTP.create({ email: emailOrPhone, otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Gửi OTP qua email hoặc SMS (giả lập)
    console.log(`OTP cho ${emailOrPhone}: ${otp}`);

    return { EC: 0, EM: "Mã OTP đã được gửi!", DT: null };
};

// --------------------------------------------------
const verifyOTP = async ( emailOrPhone, otp ) => {
    try {
        const otpRecord = await db.OTP.findOne({
            where: { emailOrPhone, otp },
            raw: true,
            nest: true,
        });
        if (!otpRecord) {
            return  { EC: 1, EM: "Mã OTP không hợp lệ!" };
        }
        if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
            return { EC: 1, EM: "Mã OTP đã hết hạn!" };
        }
        await db.OTP.destroy({ where: { emailOrPhone, otp } });
        return { EC: 0, EM: "Xác thực OTP thành công!" };
    } catch (error) {
        console.error("Lỗi khi xác nhận OTP:", error);
        return { EC: -1, EM: "Không thể gửi OTP. Vui lòng thử lại sau!" };
    }
}

// --------------------------------------------------
export default { sendOTPToEmail, sendOTPToSMS, verifyOTP };