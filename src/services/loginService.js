import db from "../models/index"
import bcrypt from 'bcryptjs';
import jwtActions from '../middleware/JWTAction';
import e from "express";
const salt = bcrypt.genSaltSync(10);

// ---------------------------------------------------------
const hashPassword = (userPassword) => {
    let hash = bcrypt.hashSync(userPassword, salt);
    return hash
}

// ---------------------------------------------------------
const checkEmail = async (userEmail) => {
    let user = await db.User.findOne({
        where: { email: userEmail },
        row: true,
        nest: true
    })

    if (user) {
        return {EM: '', EC: 0, DT: user};
    }
    return {EM: 'Email không tồn tại', EC: 1, DT: user};;
}

const checkPassword = (inputPassord, hashPassword) => {
    return bcrypt.compareSync(inputPassord, hashPassword);
}

// ---------------------------------------------------------
const registerNewUser = async (userData) => {
    console.log("check user register: ", userData)
    try {
        let isExistEmail = await checkEmail(userData.email);
        if (isExistEmail === true) {
            return {
                EM: 'Email đã được đăng ký!',
                EC: 1
            }
        }

        let hashUserPass = hashPassword(userData.password);

        let newPatient = await db.User.create({
            email: userData.email,
            password: hashUserPass,
            name: userData.name,
            address: userData.address,
            sex: userData.sex,
            phone: userData.phone,
            userType: "patient"
        })

        await db.Patient.create({
            citizenId: userData.citizenId,
            userId: newPatient.id
        });

        return {
            EM: "Đăng ký thành công!",
            EC: 0
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1
        }
    }

}

// ---------------------------------------------------------
const handleUserLogin = async ({ email, password }) => {
    try {
        const user = await db.User.findOne({
            include: [
                { model: db.Patient, required: false },
                { model: db.Doctors, required: false }
            ],
            where: { email },
            raw: true,
            nest: true
        });

        if (!user) {
            return { EM: 'Email không tồn tại!', EC: 1, DT: "" };
        }

        if (user && user.userType !== 'doctor' && user.userType !== 'patient') {
            return { EM: 'Tài khoản không thuộc quyền truy cập này! Vui lòng sử dụng đúng tài khoản.', EC: 1, DT: "" };
        }
        
        if (!checkPassword(password, user.password)) {
            return { EM: 'Sai Email hoặc mật khẩu!', EC: 1, DT: "" };
        }
        
        let payload = {
            id: user.id,
            email: user.email,
            userType: user.userType,
            name: user.name,
            avatar: user.avatar,
            // serviceId: user.serviceId,
        };
        
        if (user.userType === 'doctor' && user.Doctors) {
            payload.doctorId = user.Doctors.id;
            const service = await db.DoctorService.findOne({
                where: { doctorId: user.Doctors.id, status: 'active' },
                raw: true,
                nest: true
            })
            if (!service) {
                payload.serviceId = 0;
            } else {
                payload.serviceId = service.serviceId;
            }
        } else if (user.userType === 'patient' && user.Patients) {
            payload.patientId = user.Patients.id;
        }
        console.log("check payload: ", payload)
        return {
            EM: 'Đăng nhập thành công!',
            EC: 0,
            DT: {
                access_token: jwtActions.createJWT(payload),
                ...payload
            }
        };
    } catch {
        console.error(error)
        return { EM: "Lỗi hệ thống... ", EC: -1 };
    }
};

// ---------------------------------------------------------
export default {
    registerNewUser, 
    handleUserLogin, 
    checkEmail, 
    hashPassword
}