import userApiService from '../../services/userApiService';

const readUser = async (req, res) => {
    try {
        if (req.query.page && req.query.limit) {
            let page = req.query.page;
            let limit = req.query.limit;

            let data = await userApiService.getUserPaginate(+page, +limit);
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        } else {
            let data = await userApiService.getAllUser();
            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }

    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }

}

const createUser = async (req, res) => {
    try {
        let data = await userApiService.createNewUser(req.body);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })

    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const { email, name, sex, address } = req.body;
        const avatar = req.file ? req.file.filename : null;
        console.log({ email, name, sex, address, avatar: avatar || 'Không có ảnh' });

        const dataUser = { email, name, sex, address, avatar };
        const data = await userApiService.updateUser(dataUser);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        return res.status(200).json({
            EM: 'Something wrong from server!',
            EC: '-1',
            DT: ''
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        let data = await userApiService.deleteUser(req.body.id);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: 1,
            DT: []
        })
    }
}

const getUserAccount = async (req, res) => {
    return res.status(200).json({
        EM: 'ok',
        EC: 0,
        DT: {
            access_token: req.token,
            email: req.user.email,
            name: req.user.name,
            id: req.user.id,
            userType: req.user.userType,
            doctorId: req.user.doctorId ? req.user.doctorId : null,
            patientId: req.user.patientId ? req.user.patientId : null
        }
    })
}

export default {
    readUser, updateUser, deleteUser, createUser, getUserAccount
}