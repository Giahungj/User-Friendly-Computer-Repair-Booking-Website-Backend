import db from "../models/index"
import syncData from '../utils/syncData';

// ---------------------------------------------------------
const registerNewUser = async (userData) => {
    try {
        // return { EM: "Đăng ký thành công!", EC: 0 }
        let newPatient = await db.User.create({
            email: userData.email,
            password: userData.hashedPassword ,
            name: userData.name,
            dateofbirth: userData.dob,
            address: userData.address,
            sex: userData.sex,
            phone: userData.phone,
            userType: "patient"
        })
        await db.Patient.create({
            citizenId: userData.citizenId,
            userId: newPatient.id
        });
        await syncData.syncPatientsData();
        return {
            EM: "Đăng ký thành công !",
            EC: 0,
            DT: newPatient
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
const registerDoctorPending = async (doctorData) => {
    try {
        let newDoctorPending = await db.PendingDoctors.create(doctorData);
        return {
            EM: "Gửi đơn xét duyệt thành công!",
            EC: 0,
            DT: newDoctorPending
        };
    } catch (error) {
        console.error("Lỗi khi gửi đơn xét duyệt bác sĩ:", error);
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
            DT: {}
        };
    }
};

// ---------------------------------------------------------
export default {
    registerNewUser, registerDoctorPending
}