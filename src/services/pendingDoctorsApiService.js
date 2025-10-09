import { where } from "sequelize/lib/sequelize";
import db from "../models/index"

// ---------------------------------------------------------
const getPendingDoctorList = async (id) => {
    let doctors = await db.PendingDoctors.findAll({ raw: true, nest: true });
    let specialties = await db.Specialty.findAll({ raw: true, nest: true });
    let facilities = await db.Facility.findAll({ raw: true, nest: true });

    if (!doctors || !specialties || !facilities) {
        return { EM: '', EC: -1, DT: [] };
    }
    let specialtyMap = specialties.reduce((acc, item) => {
        acc[item.id] = item.name; 
        return acc;
    }, {});
    let facilityMap = facilities.reduce((acc, item) => {
        acc[item.id] = item.name; 
        return acc;
    }, {});

    // Cập nhật lại danh sách bác sĩ
    let updatedDoctors = doctors.map(doc => ({
        ...doc,
        specialtyName: specialtyMap[doc.specialtyId] || 'Không rõ',
        facilityName: facilityMap[doc.facilityId + 1] || 'Không rõ'
    }));

    return { 
        EM: '',
        EC: 0,
        DT: { doctors: updatedDoctors, specialties, facilities }
    };
};

// ---------------------------------------------------------
const approve = async (data) => {
    const transaction = await db.sequelize.transaction(); // 🔹 Bắt đầu transaction
    try {
        // 🔹 Tìm bác sĩ chờ duyệt
        let pendingDoctor = await db.PendingDoctors.findOne({
            where: { id: data.id },
            raw: true,
            nest: true
        });

        if (!pendingDoctor) {
            return { EM: "Không tìm thấy hồ sơ chờ duyệt!", EC: 1, DT: [] };
        }

        // 🔹 Kiểm tra email đã tồn tại chưa
        let existingUser = await db.User.findOne({
            where: { email: pendingDoctor.email },
            raw: true
        });

        if (existingUser) {
            return { EM: "Email đã tồn tại trong hệ thống!", EC: -1, DT: [] };
        }

        // 🔹 Tạo tài khoản User
        let user = await db.User.create({
            email: pendingDoctor.email,
            password: pendingDoctor.password,
            name: pendingDoctor.name,
            dateofbirth: pendingDoctor.dateofbirth,
            address: pendingDoctor.address,
            sex: pendingDoctor.sex,
            phone: pendingDoctor.phone,
            userType: pendingDoctor.userType,
            avatar: pendingDoctor.avatar,
        }, { returning: true, raw: true, transaction });

        // 🔹 Tạo Doctor Profile
        let doctor = await db.Doctors.create({
            userId: user.id,
            infor: pendingDoctor.infor,
            price: pendingDoctor.price,
            experience: pendingDoctor.experience,
            specialtyId: data.specialtyId,
            facilityId: data.facilityId
        }, { returning: true, raw: true, transaction });

        await db.PendingDoctors.destroy({
            where: { id: data.id },
            transaction
        });

        await transaction.commit(); // ✅ Commit transaction

        return {
            EM: "Phê duyệt thành công!",
            EC: 0,
            DT: { user, doctor }
        };

    } catch (error) {
        await transaction.rollback(); // ❌ Rollback nếu có lỗi
        console.error("Lỗi trong quá trình phê duyệt bác sĩ:", error);
        return { EM: "Đã có lỗi xảy ra trong quá trình phê duyệt.", EC: -1, DT: [] };
    }
};

// ---------------------------------------------------------
const reject = async (data) => {
    let pendingdoctor = await db.PendingDoctors.findOne({
        where: { id: data.id},
        raw: true,
        nest: true
    });
    return pendingdoctor
    return { 
        EM: '',
        EC: 0,
        DT: []
    };
};

// ---------------------------------------------------------
export default {
    getPendingDoctorList, approve, reject
}