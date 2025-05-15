import { asIs } from "sequelize"
import db from "../models"
import { hashPassword } from './loginService'
import { where } from "sequelize/lib/sequelize"
import syncData from "../utils/syncData"
const getAllUser = async () => {
    try {
        let users = await db.User.findAll({
            attributes: ['id', 'username', 'email', "phone", "sex"],
            include: { model: db.Group, attributes: ['name', 'description'] }

        });
        if (users) {
            return {
                EM: "Get data success!",
                EC: 0,
                DT: users
            }
        } else {
            return {
                EM: "Get data success!",
                EC: 1,
                DT: []
            }
        }
    } catch (error) {
        return {
            EM: "Something wrong from service!!!",
            EC: 1,
            DT: []
        }
    }
}

const getUserPaginate = async (page, limit) => {
    try {
        let offset = (page - 1) * limit
        let { count, rows } = await db.Doctors.findAndCountAll({
            offset: offset,
            limit: limit,
            attributes: ['infor', 'price'],
            include: { model: db.User, attributes: ['email', 'name', 'phone'] },
            order: [["id", "DESC"]]
        })
        let totalPages = Math.ceil(count / limit)
        let data = {
            totalRows: count,
            totalPages: totalPages,
            users: rows
        }
        return {
            EM: "success!",
            EC: 0,
            DT: data
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Something wrong from service!!!",
            EC: 1,
            DT: []
        }
    }
}

const createNewUser = async (data) => {
    try {
        //check email
        let isExistEmail = await checkEmail(data.email);
        // console.log(isExistEmail)
        if (isExistEmail === true) {
            return {
                EM: 'Email is already exist',
                EC: 1,
                DT: []
            }
        }
        //hash password
        let hashUserPass = hashPassword(data.password)

        await db.User.create({ ...data, password: hashUserPass })
        return {
            EM: "Created successfully!",
            EC: 0,
            DT: []
        }
    } catch (error) {
        return {
            EM: "Something wrong from service!!!",
            EC: 1,
            DT: []
        }
    }
}

const updateUser = async (dataUser) => {
    try {
        let user = await db.User.findOne({ where: { email: dataUser.email } });
        if (user) {
            await user.update({ name: dataUser.name, sex: dataUser.sex, address: dataUser.address, avatar: dataUser.avatar });
            await syncData.syncPatientsData();
            return { EM: "Update user success!", EC: 0, DT: await db.User.findOne({ where: { email: dataUser.email } }) };
        } else {
            return { EM: "User not found!", EC: 2, DT: '' };
        }
    } catch (error) {
        return {
            EM: "Somgthing wrongs with services!",
            EC: 1,
            DT: []
        }
    }
}

const deleteUser = async (id) => {
    try {
        let user = await db.User.findOne({
            where: { id: id }
        })
        if (user) {
            await user.destroy()
            return {
                EM: "Delete user success!",
                EC: 0,
                DT: []
            }

        } else {
            return {
                EM: "User not found",
                EC: 2,
                DT: []
            }
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Something wrong from service!!!",
            EC: 1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const checkEmail = async (email) => {
    try {
        let user = await db.User.findOne({
            where: { email: email }
        })

        let doctor = await db.PendingDoctors.findOne({
            where: { email: email}
        })

        if (user || doctor) {
            return {
                EM: "Email đã tồn tại",
                EC: 1,
                DT: ""
            }
        }

        return {
            EM: "Email hợp lệ",
            EC: 0,
            DT: ""
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
            DT: ""
        }
    }

}

export default {
    getAllUser, updateUser, createNewUser, deleteUser, getUserPaginate,
    checkEmail
}