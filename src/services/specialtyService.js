import { where } from "sequelize/dist/index.js";
import db from "../models"
import formatUtil from '../utils/formatUtil';
import { Op }  from 'sequelize';

// ---------------------------------------------------------
const getSpecialtyList = async () => {
    try {
        const hasDeletedField = db.Specialty.rawAttributes.hasOwnProperty('deleted')
        let specialties = await db.Specialty.findAll({
            raw: true,
            nest: true,
            where: hasDeletedField ? { deleted: false } : {},
            order: [['updatedAt', 'DESC']]
        })
        let deletedSpecialties = await db.Specialty.findAll({
            raw: true,
            nest: true,
            where: {
                deleted: true 
            },
            order: [['updatedAt', 'DESC']],
            limit: 10
        })
        for (let specialty of specialties) {
            specialty.doctorsCount = await db.Doctors.count({
                where: { specialtyId: specialty.id }
            });
            specialty.image = specialty.image ? '/images/uploads/' + specialty.image : '/images/user.png';
        }
        return {
            EM: "",
            EC: 0,
            DT: { deletedSpecialties, specialties }
        }
    } catch (error) {
        console.error("Lỗi đọc dữ liệu chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu chuyên khoa.",
            EC: -1,
            DT: { deletedSpecialties: [], specialties: [] }
        }
    }
}

// ---------------------------------------------------------
const getSpecialtyById = async (id) => {
    try {
        let specialty = await db.Specialty.findOne({
            where: { id: id },
            raw: true,
            nest: true
        });
        if (!specialty) {
            return { EM: "Không tìm thấy chuyên khoa!", EC: 1, DT: [] }
        }
        const { rows, count } = await db.Doctors.findAndCountAll({
            where: { specialtyId: id },
            include: [{ model: db.User }, { model: db.Facility }],
            raw: true,
            nest: true
        })
        let doctors = await db.Doctors.findAll({
            where: { specialtyId: { [Op.ne]: id }},
            include: [{ model: db.User }],
            raw: true,
            nest: true
        });
        const doctorOfSpecialty = { rows, count} 
        specialty.createdAt = formatUtil.formatDate(specialty.createdAt);
        specialty.updatedAt = formatUtil.formatDate(specialty.updatedAt);
        specialty.image = specialty.image?'/images/uploads/' + specialty.image:'/images/user.png'
        return { EM: "", EC: 0, DT: { specialty, doctors, doctorOfSpecialty}}
    } catch (error) {
        console.error("Lỗi đọc chi tiết chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc thông chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}
    
// ---------------------------------------------------------
const getDeletedSpecialties = async () => {
    try {
        const hasDeletedField = db.Specialty.rawAttributes.hasOwnProperty('deleted')
        if (hasDeletedField) {
            const deletedSpecialties = await db.Specialty.findAll({
                raw: true,
                nest: true,
                where: { deleted: true },
                order: [['updatedAt', 'DESC']],
            })

            return {
                EM: "Lấy danh sách chuyên khoa đã xóa thành công.",
                EC: 0,
                DT: deletedSpecialties
            }
        } else {
            return {
                EM: "Trường 'deleted' không tồn tại trong bảng Specialty.",
                EC: -1,
                DT: []
            }
        }
    } catch (error) {
        console.error("Lỗi đọc dữ liệu chuyên khoa đã xóa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu chuyên khoa đã xóa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const createSpecialty = async (fieldData) => {
    try {
        const existingSpecialty = await db.Specialty.findOne({
            where: {
                name: fieldData.specialtyName,
                deleted: false
            }
        })
        const data = await getSpecialtyList()
        if (existingSpecialty) {
            return {
                EM: "Chuyên khoa đã tồn tại.",
                EC: 1,
                DT: data.DT
            }
        }
        const deletedSpecialty = await db.Specialty.findOne({
            where: {
                name: fieldData.specialtyName,
                deleted: true
            }
        })
        if (deletedSpecialty) {
            return {
                EM: "Chuyên khoa đã tồn tại nhưng bị xóa. Bạn có muốn khôi phục lại không?",
                EC: 3,
                DT: data.DT
            }
        }
        const newSpecialty = await db.Specialty.create({
            name: fieldData.specialtyName,
            description: fieldData.specialtyDescription,
            image: fieldData.specialtyImage,
        })
        if (!newSpecialty || !newSpecialty.id) {
            return {
                EM: "Tạo chuyên khoa thất bại.",
                EC: -1,
                DT: data.DT
            }
        }
        let createdSpecialty = await db.Specialty.findOne({
            where: { name: fieldData.specialtyName },
            raw: true,
            nest: true
        })
        createdSpecialty.image = createdSpecialty.image?'/image/uploads/'+createdSpecialty.image:'/image/user.png'
        return {
            EM: "Tạo chuyên khoa thành công!",
            EC: 0,
            DT: createdSpecialty
        }
    } catch (error) {
        console.error("Lỗi tạo chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi tạo chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const restoreSpecialty = async (specialtyId) => {
    try {
        let [updatedCount] = await db.Specialty.update(
            { deleted: false },
            { where: { id: specialtyId } }
        )
        if (updatedCount === 1) {
            let restoreSpecialty = await getSpecialtyById(specialtyId)
            return {
                EM: "Chuyên khoa đã được khôi phục!",
                EC: 0,
                DT: restoreSpecialty.DT
            }
        } else {
            return {
                EM: "Không tìm thấy chuyên khoa để khôi phục.",
                EC: -1,
                DT: []
            }
        }
    } catch (error) {
        console.error("Lỗi khôi phục chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi khôi phục chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const deleteSpecialty = async (specialtyId) => {
    try {
        let [updatedCount] = await db.Specialty.update(
            { deleted: 1 },
            { where: { id: specialtyId } }
        )
        if (updatedCount === 1) {
            const data = await getSpecialtyList() 
            return { EM: "Xóa chuyên khoa thành công!", EC: 0, DT: data.DT }
        } else {
            return { EM: "Lỗi không thể xóa chuyên khoa. Vui lòng thử lại!", EC: -1, DT: { specialties: [], deletedSpecialties: [] }}
        }
    } catch (error) {
        console.error("Lỗi xóa chuyên khoa:", error)
        return { EM: "Đã có lỗi xảy ra khi xóa chuyên khoa.", EC: -1, DT: [] }
    }
}

// ---------------------------------------------------------
const updateSpecialty = async (fieldData) => {
    try {
        const [updatedCount] = await db.Specialty.update(
            {
                name: fieldData.specialtyName,
                description: fieldData.specialtyDescription,
                image: fieldData.specialtyImage,
            },
            {
                where: { id: fieldData.specialtyId }, 
                raw: true,
                nest: true
            }
        )

        if (updatedCount === 1) {
            let specialty = await getSpecialtyById(fieldData.specialtyId)
            return {
                EM: "Cập nhật chuyên khoa thành công!",
                EC: 0,
                DT: specialty.DT
            }
        } else {
            return {
                EM: "Không tìm thấy chuyên khoa để cập nhật.",
                EC: 1,
                DT: []
            }
        }
    } catch (error) {
        console.error("Lỗi cập nhật chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi cập nhật chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const deleteAllDeletedSpecialties = async () => {
    try {
        const deletedCount = await db.Specialty.destroy({
            where: { deleted: 1 }
        });

        if (deletedCount > 0) {
            return {
                EM: `Đã xóa vĩnh viễn ${deletedCount} chuyên khoa!`,
                EC: 0,
                DT: []
            };
        } else {
            return {
                EM: "Không có chuyên khoa nào để xóa.",
                EC: -1,
                DT: []
            };
        }
    } catch (error) {
        console.error("Lỗi xóa chuyên khoa vĩnh viễn:", error);
        return {
            EM: "Đã có lỗi xảy ra khi xóa chuyên khoa vĩnh viễn.",
            EC: -1,
            DT: []
        };
    }
};

// ---------------------------------------------------------
const addDoctorsToSpecialtyInDB = async (specialtyId, doctorIds) => {
    try {
        const updatedCount = await db.Doctors.update(
            { specialtyId: specialtyId },
            { where: { id: doctorIds } }
        );
        if (updatedCount[0] > 0) {
            return { EM: "Thêm bác sĩ vào chuyên khoa thành công!", EC: 0, DT: [] };
        } else {
            return { EM: "Thêm bác sĩ vào chuyên khoa thất bại!", EC: -1, DT: [] };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật DB trong API Service:", error);
        return {
            EM: "Lỗi khi thao tác với Database!",
            EC: -1,
            DT: {}
        };
    }
};

// switchTheDoctorSpecialty
const switchTheDoctorSpecialty = async (doctorId, specialtyId, oldSpecialtyId) => {
    try {
        const resuilt = await db.Doctors.update({specialtyId: specialtyId}, {
            where: { id: doctorId }
        })
        return { EM: "", EC: 0, DT: resuilt }
    } catch (error) {
        console.error("Lỗi đọc dữ liệu chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
export default {
    // ===== Lấy danh sách, chi tiết chuyên khoa =====
    getSpecialtyList,
    getSpecialtyById,
    getDeletedSpecialties,

    // ===== Thao tác CRUD với chuyên khoa =====
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    restoreSpecialty,
    deleteAllDeletedSpecialties,

    // ===== Liên kết bác sĩ với chuyên khoa =====
    addDoctorsToSpecialtyInDB,
    switchTheDoctorSpecialty
}
