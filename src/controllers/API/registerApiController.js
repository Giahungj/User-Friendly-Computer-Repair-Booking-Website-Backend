import bcrypt from 'bcryptjs';
import registerApiService from '../../services/registerApiService'
import checkApiService from '../../services/API/loginApiService';
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
const handleSignUpNewUser = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const emailCheck = await checkApiService.checkEmail(email);
        console.log("✅ Check email result:", emailCheck);
        if (emailCheck.EC !== 0) {
            return res.status(400).json(emailCheck);
        }
        const phoneCheck = await checkApiService.checkPhoneNumber(phone);
        console.log("✅ Check phone result:", phoneCheck);
        if (phoneCheck.EC !== 0) {
            return res.status(400).json(phoneCheck);
        }
        const hashedPassword = await hashPassword(password);
        const userData = { email, hashedPassword, name, phone };
        const result = await registerApiService.createNewUser(userData);
        console.log("✅ User registration result:", result);
        if (result.EC !== 0) {
            return res.status(400).json(result);
        }
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
    handleRegisterDoctor, handleSignUpNewUser, handleCheckEmail, hashPassword
}