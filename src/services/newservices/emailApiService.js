import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});

/**
 * Gửi email thông báo
 * @param {string} toEmail - Email người nhận
 * @param {string} message - Nội dung thông báo
 * @param {string} link - Đường dẫn truy cập
 */
async function sendNotificationEmail(toEmail, message, link) {
    try {
        const mailOptions = {
            from: '"Hệ thống" <techfix.email@gmail.com>',
            to: toEmail,
            subject: "Thông báo từ hệ thống",
            html: `
                <p>${message}</p>
                <p>Truy cập: <a href="${link}" target="_blank">${link}</a></p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email đã gửi:", info.response);
    } catch (err) {
        console.error("Gửi email thất bại:", err);
    }
}

// Ví dụ sử dụng
// sendNotificationEmail("nguoi.nhan@gmail.com", "Bạn có một thông báo mới", "http://example.com");
// --------------------------------------------------
export default { 
    sendNotificationEmail
};
