import db from "../../models/index"
import bcrypt from 'bcryptjs';
import checkApiService from "./checkApiService";
import jwtActions from '../../middleware/JWTAction';
import { initCompiler } from "sass";
const salt = bcrypt.genSaltSync(10);

// ---------------------------------------------------------
const signInUserByEmail = async ( email, password ) => {
	try {
		const user = await db.User.findOne({
			where: { email },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar'],
			include: [
				{ model: db.Customer, attributes: ['customer_id'] },
				{ model: db.Technician, attributes: ['technician_id'] },
				{ model: db.StoreManager, attributes: ['manager_id'] }
			],
			raw: true,
			nest: true
		});
		if (!user) { return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }}
		const role =
			user.Technician?.technician_id
				? 'technician'
				: user.StoreManager?.manager_id
				? 'store_manager'
				: user.Customer?.customer_id
				? 'customer'
				: null;
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
			role: role,
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
		const user = await db.User.findOne({
			where: { phone },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar'],
			include: [
				{ model: db.Customer, attributes: ['customer_id'] },
				{ model: db.Technician, attributes: ['technician_id'] },
				{ model: db.StoreManager, attributes: ['manager_id'] }
			],
			raw: true,
			nest: true
		});
		if (!user) { return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }}
		const role =
			user.Technician?.technician_id
				? 'technician'
				: user.StoreManager?.manager_id
				? 'store_manager'
				: user.Customer?.customer_id
				? 'customer'
				: null;
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
			role: role,
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