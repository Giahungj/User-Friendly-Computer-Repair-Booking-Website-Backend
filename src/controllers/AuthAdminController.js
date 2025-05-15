import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index';
import loginSevice from '../services/loginService'
import AuthAdminService from '../services/AuthAdminService'

// --------------------------------------------------
const getAdminLoginPage = async (req, res) => {
    return res.render('pages/adminLoginPage')
}

// --------------------------------------------------
const handleAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await loginSevice.checkEmail(email);
        if (admin.EC !==0) {
            return res.render('pages/adminLoginPage',
                { EC: admin.EC, EM: admin.EM }
            )
        }
        if (admin.DT.userType !== 'admin') {
            return res.render('pages/adminLoginPage', { EC: 1, EM: 'Tài khoản không có quyền truy cập!' });
        }
        const isMatch = await bcrypt.compare(password, admin.DT.password);
        if (!isMatch) {
            return res.render('pages/adminLoginPage',
                { EC: 1, EM: 'Sai mật khẩu!' }
            )
        }
        const token = jwt.sign(
            { 
                id: admin.DT.id, 
                role: "admin", 
                name: admin.DT.name, 
                email: admin.DT.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        );

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: false,
            maxAge: 7200000, // 2 giờ
        });
        return res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const handleAdminLogout = async (req, res) => {
    try {
        res.clearCookie("adminToken");
        return res.redirect("/admin-login");
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
export default {
    getAdminLoginPage,
    handleAdminLogin,
    handleAdminLogout
}

// listAllAdmins()
// resetPassword()
// changeEmail()
// viewLoginHistory()
// updateProfilePicture()Hỗ trợ admin thay đổi ảnh đại diện web