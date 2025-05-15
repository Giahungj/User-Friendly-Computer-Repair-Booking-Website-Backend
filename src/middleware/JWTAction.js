import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config()

const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;
    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN });
    } catch (error) {
        console.log(error)
    }
    return token;
}

const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;
    try {
        decoded = jwt.verify(token, key);
    } catch (error) {
        console.log(error)
    }
    return decoded;
}

const checkUserJWT = (req, res, next) => {
    let cookies = req.cookies;
    console.log("Cookies:", cookies);
    if (cookies && cookies.jwt) {
        let token = cookies.jwt;
        console.log("Token received:", token);
        let decoded = verifyToken(token);
        if (decoded) {
            console.log("Decoded Token:", decoded);
            req.user = decoded;
            req.token = token;
            next();
        } else {
            console.log("JWT Verification Failed!");
            return res.status(401).json({ EC: -1, EM: "Not authenticated the user", DT: '' });
        }
    } else {
        console.log("JWT not found in cookies!");
        return res.status(401).json({ EC: -1, EM: "Not authenticated the user", DT: '' });
    }
};

const checkDoctorAccess = (req, res, next) => {
    try {
        // Giả sử bạn đã lưu thông tin người dùng trong `req.user` sau khi xác thực (ví dụ JWT)
        const userType = req.user.userType;
        if (userType !== 'doctor') {
            return res.status(200).json({
                EC: 1,
                EM: "You don't have permisson to access this resource!",
                DT: ''
            })
        }

        // Nếu quyền hợp lệ, cho phép truy cập
        next();
    } catch (error) {
        return res.status(200).json({
            EC: -1,
            EM: "You don't have permisson to access this resource!",
            DT: ''
        })
    }
};




export default {
    createJWT, verifyToken, checkUserJWT, checkDoctorAccess
}