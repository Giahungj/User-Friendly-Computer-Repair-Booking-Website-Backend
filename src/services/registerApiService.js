import db from "../models/index"
import syncData from '../utils/syncData';

// ---------------------------------------------------------
const checkEmail = async (email) => {
    try {
        const user = await db.User.findOne({
            where: { email: email }
        })
        if (user) {
            return {
                EM: "Email đã tồn tại! Vui lòng sử dụng email khác.",
                EC: 1,
            }
        }
        return {
            EM: "Email hợp lệ",
            EC: 0,
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
        }
    }
}

// ---------------------------------------------------------
const checkPhoneNumber = async (phone) => {
    try {
        const user = await db.User.findOne({
            where: { phone: phone }
        })
        if (!user) {
            return {
                EM: "Số điện thoại không tồn tại! Vui lòng sử dụng số điện thoại khác.",
                EC: 1,
            }
        }
        return {
            EM: "Số điện thoại hợp lệ",
            EC: 0,
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
        }
    }
}

// ---------------------------------------------------------
const createNewUser = async (userData) => {
    try {
        // return { EM: "Đăng ký thành công!", EC: 0 }
        let newUser = await db.User.create({
            email: userData.email,
            password: userData.hashedPassword ,
            name: userData.name,
            phone: userData.phone,
        })
        await db.Customer.create({
            user_id: newUser.user_id
        });
        // await syncData.syncPatientsData(); Tìm kiếm người dùng
        return {
            EM: "Đăng ký thành công !",
            EC: 0,
            DT: newUser
        };
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1
        }
    }

}

// ---------------------------------------------------------
export default {
    checkEmail,
    checkPhoneNumber,
    createNewUser
}