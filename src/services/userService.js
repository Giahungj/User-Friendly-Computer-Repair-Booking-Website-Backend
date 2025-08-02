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

const getDoctorById = async (id) => {
    try {
        const doctor = await db.Doctors.findOne({
            where: { userId: id },
            raw: true,
            nest: true,
            include: [
                {
                    model: db.User,
                    attributes: ['email', 'name', 'address', 'phone', 'sex']
                }
            ]
        })
        return doctor
    } catch (error) {
        return error
    }
}

const createNewDoctor = async (doctor) => {
    const existingUser = await db.User.findOne({ where: { email: doctor.email } });
    if (existingUser) {
        return "email exsisted!"
    }
    let hashPass = hashPassword(doctor.password);
    try {
        let newDoctor = await db.User.create({
            email: doctor.email,
            password: hashPass,
            name: doctor.name,
            address: doctor.address,
            sex: doctor.sex,
            phone: doctor.phone,
            userType: "doctor"
        })

        await db.Doctors.create({
            infor: doctor.infor,
            price: doctor.price,
            experience: doctor.experience,
            userId: newDoctor.id,
            specialtyId: doctor.specialtyId,
            facilityId: doctor.facilityId
        });

        return "Create user success!"
    } catch (error) {
        return error
    }
}

const UpdateDoctorInfor = async (doctor, id) => {
    try {
        await db.User.update(
            {
                email: doctor.email,
                name: doctor.name,
                address: doctor.address,
                sex: doctor.sex,
                phone: doctor.phone,
            },
            {
                where: { id: id }
            }

        )
        await db.Doctors.update(
            {
                price: doctor.price,
                infor: doctor.infor,
                experience: doctor.experience,
                specialtyId: doctor.specialtyId,
                facilityId: doctor.facilityId
            },
            {
                where: { userId: id }
            }

        )
    } catch (error) {
        console.log("check error: ", error)
    }

}

const deleteDoctorById = async (id) => {
    try {
        await db.Doctors.destroy({
            where: {
                userId: id
            }
        })
        await db.User.destroy({
            where: {
                id: id
            }
        })

    } catch (error) {
        console.log(error)
    }
}

const getAllSpecialty = async () => {
    try {
        let specialty = await db.Specialty.findAll({
            attributes: ['id', 'name']
        })
        return specialty
    } catch (error) {
        console.log("check error: ", error)
    }

}

const getAllFacility = async () => {
    try {
        let facility = await db.Facility.findAll({
            attributes: ['id', 'name']
        })
        return facility
    } catch (error) {
        console.log("check error: ", error)
    }
}

const deleteUser = async (userId) => {
    await db.User.destroy({
        where: { id: userId }
    })

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
	deleteUser,
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
