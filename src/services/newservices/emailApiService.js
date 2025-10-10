import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "audat154a@gmail.com",
		pass: "tyxb wsqc mhid ilvg", // App Password ở bước trên
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
        console.log("Gửi đến Email:", toEmail)
		const mailOptions = {
			from: '"Hệ thống" <ten_tai_khoan@gmail.com>',
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

export default { sendNotificationEmail };
