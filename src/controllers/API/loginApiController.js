import loginApiService from '../../services/API/loginApiService';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("❌ Thiếu email hoặc password");
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByEmail(email, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByPhone = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByPhone(phone, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByEmailForTechnician = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("❌ Thiếu email hoặc password");
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByEmailForTechnician(email, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByPhoneForTechnician = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByPhoneForTechnician(phone, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByEmailForStoreManager = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("❌ Thiếu email hoặc password");
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByEmailForStoreManager(email, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const signInByPhoneForStoreManager = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({
                EM: "Thiếu thông tin đăng nhập",
                EC: -1,
                DT: ""
            });
        }
        const data = await loginApiService.signInUserByPhoneForStoreManager(phone, password);
        if (data?.DT?.access_token) {
            res.cookie("jwt", data.DT.access_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            });
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
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    signInByEmail, signInByPhone,
    signInByEmailForTechnician, signInByPhoneForTechnician,
    signInByEmailForStoreManager, signInByPhoneForStoreManager,
    
}