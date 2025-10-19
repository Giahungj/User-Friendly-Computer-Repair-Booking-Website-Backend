import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import db from '../models/index';
import user from '../models/user';
import { where } from 'sequelize/lib/sequelize';

const salt = bcrypt.genSaltSync(10);

const hashPassword = (userPassword) => {
    let hash = bcrypt.hashSync(userPassword, salt);
    return hash
}

const createNewUser = async (email, password, username, address) => {
    let hashPass = hashPassword(password);
    try {
        await db.User.create({
            email: email,
            password: hashPass,
            username: username,
            address: address
        })
    } catch (error) {
        console.log("Check error: ", error)
    }
}

const getAllUser = async () => {
    try {
        let user = await db.User.findAll({
            order: [['createdAt', 'DESC']]
        });
        return user
    } catch (error) {
        console.log("check error: ", error)
    }
}

const getAllDoctor = async () => {
    try {
        let doctors = await db.Doctors.findAll({
            attributes: ["id", "userId"],
            include: [
                {
                    model: db.User,
                    attributes: ['email', 'name']
                },
                {
                    model: db.Facility,
                    attributes: ['name']
                },
                {
                    model: db.Specialty,
                    attributes: ['name']
                }
            ]
        })
        return doctors
    } catch (error) {
        console.log("check error: ", error)
    }
}

const getUserById = async (userId) => {
    let user = {}
    user = await db.User.findOne({
        where: { id: userId }
    });
    return user;
}

const updateUserInfor = async (email, username, address, id) => {
    let userUpdate = await db.User.update({
        email: email,
        username: username,
        address: address
    }, {
        where: { id: id }
    })
    return userUpdate;
}

export default {
	// 📌 User
	createNewUser,
	getAllUser,
	getUserById,
	updateUserInfor,

	// 📌 Doctor
	createNewDoctor,
	deleteDoctorById,
	getAllDoctor,
	getDoctorById,
	UpdateDoctorInfor,

	// 📌 Facility & Specialty
	getAllFacility,
	getAllSpecialty,
};
