import loginService from '../../services/loginService'

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
const handleLogin = async (req, res) => {
    try {
        const data = await loginService.handleUserLogin(req.body);
        if (data && data.DT && data.DT.access_token) {
            res.cookie("jwt", data.DT.access_token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        }
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

export default {
    testApi, handleRegister, handleLogin
}