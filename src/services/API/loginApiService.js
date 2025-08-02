import db from "../../models/index"
import bcrypt from 'bcryptjs';
import checkApiService from "./checkApiService";
import jwtActions from '../../middleware/JWTAction';
const salt = bcrypt.genSaltSync(10);

// ---------------------------------------------------------
const signInUserByEmail = async ( email, password ) => {
	try {
		console.log("📥 [LOGIN SERVICE] Input:", email, password);

		const user = await db.User.findOne({
			where: { email: email},
			raw: true,
			nest: true
		});

		if (!user) {
			console.log("❌ Không tìm thấy tài khoản:", email);
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" };
		}

		console.log("✅ Tìm thấy người dùng:", user.name);

		const isMatch = checkApiService.checkPassword(password, user.password);
		if (!isMatch) {
			return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
		}

		const payloadToken = {
			user_id: user.user_id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
            phone: user.phone,
		};

		return {
			EM: 'Đăng nhập thành công!',
			EC: 0,
			DT: {
				access_token: jwtActions.createJWT(payloadToken),
				...payloadToken
			}
		};
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};

// ---------------------------------------------------------
const singInUserByPhone = async ( phone, password ) => {
	try {
		console.log("📥 [LOGIN SERVICE] Input:", phone, password);

		const user = await db.User.findOne({
			where: { phone: phone },
			raw: true,
			nest: true
		});

		if (!user) {
			console.log("❌ Không tìm thấy tài khoản:", phone);
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" };
		}

		console.log("✅ Tìm thấy người dùng:", user.name);

		const isMatch = checkApiService.checkPassword(password, user.password);
		if (!isMatch) {
			return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
		}

		const payloadToken = {
			user_id: user.user_id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
            phone: user.phone,
		};

		return {
			EM: 'Đăng nhập thành công!',
			EC: 0,
			DT: {
				access_token: jwtActions.createJWT(payloadToken),
				...payloadToken
			}
		};
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};

// ---------------------------------------------------------
export default {
    signInUserByEmail, singInUserByPhone
}