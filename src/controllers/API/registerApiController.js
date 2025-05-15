import bcrypt from 'bcryptjs';
import registerApiService from '../../services/registerApiService'
import userApiService from '../../services/userApiService'
const salt = bcrypt.genSaltSync(10);

// ---------------------------------------------------------
const hashPassword = async (userPassword) => {
    return bcrypt.hashSync(userPassword, salt);
}

// ---------------------------------------------------------
const handleCheckEmail = async (req, res) => {
    try {
        let email = await req.body.email
        const data = await userApiService.checkEmail(email)
        
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Lỗi hệ thống...",
            EC: "-1",
            DT: ""
        })
    }
}

// ---------------------------------------------------------
const handleRegisterPatient = async (req, res) => {
    try {
        const { email, password, name, address, phone, citizenId, sex, dob } = req.body
        const hashedPassword  = await hashPassword(password)
        const userData = { email, hashedPassword , name, address, phone, citizenId, sex, dob }
        const result  = await registerApiService.registerNewUser(userData)
        return res.status(200).json(result);
        
    } catch (error) {
        console.error("Lỗi khi xử lý đăng ký bác sĩ:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ!", EC: -1, DT: {} });
    }
}

// ---------------------------------------------------------
const handleRegisterDoctor = async (req, res) => {
    try {
        const avatarName = req.file ? req.file.filename : null;
        const doctor = req.body
        const sexValue = doctor.sex === 'male' ? 1 : 0;
        const priceValue = parseFloat(doctor.price);
        const password = hashPassword(doctor.password)
        const doctorData = {
            email: doctor.email,
            password: password,
            name: doctor.name,
            address: doctor.address,
            sex: sexValue,
            phone: doctor.phone,
            specialtyId: doctor.specialtyId,
            experience: doctor.experience,
            infor: doctor.description,
            avatar: avatarName,
            price: priceValue,
            userType: doctor.userType,
            dateofbirth: doctor.dateofbirth,
            facilityId: doctor.facilityId
        }
        const resuilt = await registerApiService.registerDoctorPending(doctorData)
        return res.status(200).json({
            EM: resuilt.EM,
            EC: resuilt.EC,
            DT: resuilt.DT
        })
    } catch (error) {
        console.error("Lỗi khi xử lý đăng ký bác sĩ:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ!", EC: -1, DT: {} });
    }
}

// ---------------------------------------------------------
export default {
    handleRegisterDoctor, handleRegisterPatient, handleCheckEmail, hashPassword
}