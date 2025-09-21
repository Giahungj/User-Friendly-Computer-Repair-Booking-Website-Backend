import db from "../../models/index"
import checkApiService from "./checkApiService";
import jwtActions from '../../middleware/JWTAction';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByEmail = async ( email, password ) => {
	try {
		const user = await db.User.findOne({
			where: { email: email },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (!user) {
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }
		}
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
			role: 'customer',
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByPhone = async ( phone, password ) => {
	try {
		const user = await db.User.findOne({
			where: { email: email },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (!user) return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" };
		const isMatch = checkApiService.checkPassword(password, user.password);
		if (!isMatch) return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
		const payloadToken = {
			user_id: user.user_id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
            phone: user.phone,
			role: 'customer',
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByEmailForStoreManager = async ( email, password ) => {
	try {
		const user = await db.User.findOne({
			where: { email: email },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (user?.role === 1) {
			const storeManagerId = await db.StoreManager.findOne({
				attributes: ['store_manager_id'],
				include: [
					{
						model: db.User,
						where: { email: email }
					},
					{
						model: db.Store,
						attributes: ['store_id']
					}
				]
			});
			const isMatch = checkApiService.checkPassword(password, user.password);
			if (!isMatch || !storeManagerId) {
				return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
			}
			const payloadToken = {
				user_id: user.user_id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				phone: user.phone,
				role: 'store_manager',
				storeManagerId: storeManagerId?.store_manager_id || null,
				storeId: storeManagerId?.Store?.store_id || null
			};
			return {
				EM: 'Đăng nhập thành công!',
				EC: 0,
				DT: {
					access_token: jwtActions.createJWT(payloadToken),
					...payloadToken
				}
			};
		} else {
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }
		}
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByPhoneForStoreManager = async ( phone, password ) => {
	try {
		const user = await db.User.findOne({
			where: { phone: phone },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (user.role === 1) {
			const storeManagerId = await db.StoreManager.findOne({
				attributes: ['store_manager_id'],
				include: [
					{
						model: db.User,
						where: { phone: phone }
					},
					{
						model: db.Store,
						attributes: ['store_id']
					}
				]
			});
			const isMatch = checkApiService.checkPassword(password, user.password);
			if (!isMatch || !storeManagerId) {
				return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
			}
			const payloadToken = {
				user_id: user.user_id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				phone: user.phone,
				role: 'store_manager',
				storeManagerId: storeManagerId?.store_manager_id || null,
				storeId: storeManagerId?.Store?.store_id || null
			};
			return {
				EM: 'Đăng nhập thành công!',
				EC: 0,
				DT: {
					access_token: jwtActions.createJWT(payloadToken),
					...payloadToken
				}
			};
		} else {
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }
		}
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByEmailForTechnician = async ( email, password ) => {
	try {
		const user = await db.User.findOne({
			where: { email: email },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (user?.role === 2) {
			const technicianId = await db.Technician.findOne({
				attributes: ['technician_id'],
				include: [
					{
						model: db.User,
						where: { email: email }
					},
					{
						model: db.Store,
						attributes: ['store_id']
					}
				]
			});
			const isMatch = checkApiService.checkPassword(password, user.password);
			if (!isMatch || !technicianId) {
				return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
			}
			const payloadToken = {
				user_id: user.user_id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				phone: user.phone,
				role: 'technician',
				technicianId: technicianId?.technician_id || null,
				storeId: technicianId?.Store?.store_id || null
			};
			return {
				EM: 'Đăng nhập thành công!',
				EC: 0,
				DT: {
					access_token: jwtActions.createJWT(payloadToken),
					...payloadToken
				}
			};
		} else {
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }
		}
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInUserByPhoneForTechnician = async ( phone, password ) => {
	try {
		const user = await db.User.findOne({
			where: { phone: phone },
			attributes: ['user_id', 'name', 'phone', 'email', 'avatar', 'password', 'role'],
		});
		if (user.role === 2) {
			const technicianId = await db.Technician.findOne({
				attributes: ['technician_id'],
				include: [
					{
						model: db.User,
						where: { phone: phone }
					},
					{
						model: db.Store,
						attributes: ['store_id']
					}
				]
			});
			const isMatch = checkApiService.checkPassword(password, user.password);
			if (!isMatch || !technicianId) {
				return { EM: 'Sai thông tin đăng nhập!', EC: 1, DT: "" };
			}
			const payloadToken = {
				user_id: user.user_id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				phone: user.phone,
				role: 'technician',
				technicianId: technicianId?.technician_id || null,
				storeId: technicianId?.Store?.store_id || null
			};
			return {
				EM: 'Đăng nhập thành công!',
				EC: 0,
				DT: {
					access_token: jwtActions.createJWT(payloadToken),
					...payloadToken
				}
			};
		} else {
			return { EM: 'Tài khoản không tồn tại!', EC: 1, DT: "" }
		}
	} catch (error) {
		console.error(error);
		return { EM: "Lỗi hệ thống...", EC: -1 };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    signInUserByEmail, signInUserByPhone,
	signInUserByEmailForStoreManager, signInUserByPhoneForStoreManager,
	signInUserByEmailForTechnician, signInUserByPhoneForTechnician
}