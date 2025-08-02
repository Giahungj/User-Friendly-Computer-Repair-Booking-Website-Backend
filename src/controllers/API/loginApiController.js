import loginService from '../../services/loginService';
import loginApiService from '../../services/API/loginApiService';

// ---------------------------------------------------------
const testApi = (req, res) => {
    return res.status(200).json({
        message: "test api",
        data: "api 11"
    })
}

// ---------------------------------------------------------
const handleRegister = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(200).json({
                EM: "Thiếu thông tin",
                EC: "-1",
                DT: ""
            })
        }

        let data = await loginService.registerNewUser(req.body)

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: ""
        })

    } catch (error) {
        return res.status(500).json({
            EM: "Lỗi hệ thống...",
            EC: "-1",
            DT: ""
        })
    }
}

// ---------------------------------------------------------
const signInByEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📥 [SIGN-IN] Input received:", email, password);

        if (!email || !password) {
            console.log("❌ Thiếu email hoặc password");
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }

        console.log("🚀 Gửi loginPayload đến service:", email, password);

        const data = await loginApiService.signInUserByEmail(email, password);
        console.log("✅ Kết quả trả về từ service:", data);

        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
            console.log("🍪 JWT cookie đã được set");
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Lỗi hệ thống...",
            EC: "-1",
            DT: ""
        })
    }
}

// ---------------------------------------------------------
const signInByPhone = async (req, res) => {
    try {
        const { phone, password } = req.body;
        console.log("📥 [SIGN-IN] Input received:", phone, password);

        if (!phone || !password) {
            console.log("❌ Thiếu email hoặc password");
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }

        console.log("🚀 Gửi loginPayload đến service:", phone, password);

        const data = await loginApiService.singInUserByPhone(phone, password);
        console.log("✅ Kết quả trả về từ service:", data);

        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
            console.log("🍪 JWT cookie đã được set");
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Lỗi hệ thống...",
            EC: "-1",
            DT: ""
        })
    }
}

export default {
    testApi, handleRegister, signInByEmail, signInByPhone
}