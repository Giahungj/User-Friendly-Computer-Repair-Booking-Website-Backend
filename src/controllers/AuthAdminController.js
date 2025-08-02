import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index';
import loginSevice from '../services/loginService'
import AuthAdminService from '../services/AuthAdminService'
import { raw } from 'body-parser';

// --------------------------------------------------
const getAdminLoginPage = async (req, res) => {
    return res.render('pages/adminLoginPage')
}

// --------------------------------------------------
const handleAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginSevice.checkEmail(email);
        if (user.EC !==0) {
            return res.render('pages/adminLoginPage',
                { EC: user.EC, EM: user.EM }
            )
        }
        console.log("Người dùng tồn tại");
        const admin = await db.Admin.findOne({
            where: { user_id: user.DT.user_id },
            raw: true,
        });
        console.log("Người dùng là admin", admin);

        if (!admin) {
            return res.render('pages/adminLoginPage', { EC: 1, EM: 'Tài khoản không có quyền truy cập!' });
        }
        const isMatch = await bcrypt.compare(password, user.DT.password);
        if (!isMatch) {
            return res.render('pages/adminLoginPage',
                { EC: 1, EM: 'Sai mật khẩu!' }
            )
        }
        console.log("Người dùng đăng nhập đúng mật khẩu");
        const token = jwt.sign(
            { 
                admin_id: admin.admin_id, 
                role: "admin", 
                name: user.DT.name, 
                email: user.DT.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        );
        console.log("Token được tạo thành công", token);

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: false,
            maxAge: 7200000, // 2 giờ
        });
        console.log("Cookie adminToken đã được thiết lập");
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