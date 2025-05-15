import { where } from 'sequelize/lib/sequelize';
import db from '../models/index';
import specialtyService from '../services/specialtyService';
import doctorApiService from '../services/doctorApiService';
// --------------------------------------------------
const renderSpecialtiesPage = async (req, res) => {
    try {
        const data = await specialtyService.getSpecialtyList()
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyList.ejs`,
            pageTitle: 'Quản lý chuyên khoa',
            EC: data.EC,
            specialties: data.DT.specialties,
            deletedspecialties: data.DT.deletedSpecialties,
            EM: data.EM
        })
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

const renderSpecialtyDetailPage = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await specialtyService.getSpecialtyById(id);
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDetail.ejs`,
            pageTitle: 'Chi tiết chuyên khoa',
            EC: 0,
            specialty: data.DT.specialty,
            doctors: data.DT.doctors,
            doctorOfSpecialty: data.DT.doctorOfSpecialty,
            EM: ''
        });

    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
};

// --------------------------------------------------
const renderDeletedSpecialtyListPage = async (req, res) => {
    try {
        const data = await specialtyService.getDeletedSpecialties();

        if (data.EC !== 0) {
            return res.render('layouts/layout', {
                page: `pages/specialties/specialtyDeletedList.ejs`,
                pageTitle: 'Quản lý chuyên khoa',
                EC: data.EC,
                deletedspecialties: data.DT || [],
                EM: data.EM || 'Có lỗi xảy ra khi lấy danh sách chuyên khoa đã xoá.'
            });
        }

        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDeletedList.ejs`,
            pageTitle: 'Quản lý chuyên khoa',
            EC: 0,
            deletedspecialties: data.DT,
            EM: ''
        });

    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
};

// --------------------------------------------------
const createSpecialty = async (req, res) => {
    try {
        const fieldData = {
            ... req.body,
            specialtyImage: req.file ? req.file.filename : req.body.oldImage
        }
        const data = await specialtyService.createSpecialty(fieldData)
        if (data.EC !== 0) {
            return res.status(201).json({ EC: data.EC, EM: data.EM, DT: [] });
        }
        return res.status(201).json({ EC: data.EC, EM: data.EM, DT: data.DT });
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
const updateSpecialty = async (req, res) => {
    try {
        const fieldData = {
            ... req.body,
            specialtyImage: req.file ? req.file.filename : req.body.oldImage
        }
        const data = await specialtyService.updateSpecialty(fieldData)
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDetail.ejs`,
            pageTitle: 'Chi tiết chuyên khoa',
            EC: data.EC,
            EM: data.EM,
            specialty: data.DT.specialty,
            doctors: data.DT.doctors,
            doctorOfSpecialty: data.DT.doctorOfSpecialty,
        })
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
const deleteSpecialty = async (req, res) => {
    try {
        const specialtyId = req.body.specialtyId;
        const updateResult = await doctorApiService.updateDoctorSpecialty(specialtyId);
        if (updateResult.EC !== 0) {
            const data = await specialtyService.deleteSpecialty(specialtyId);
            return res.render('layouts/layout', {
                page: `pages/specialties/specialtyList.ejs`,
                pageTitle: 'Quản lý chuyên khoa',
                EC: data.EC,
                specialties: data.DT.specialties,
                deletedspecialties: data.DT.deletedSpecialties,
                EM: data.EM
            });
        } else {
            const data = await specialtyService.getSpecialtyList();
            return res.render('layouts/layout', {
                page: `pages/specialties/specialtyList.ejs`,
                pageTitle: 'Quản lý chuyên khoa',
                EC: updateResult.EC,
                specialties: data.DT.specialties,
                deletedspecialties: data.DT.deletedSpecialties,
                EM: data.EM
            });
        }
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
};

// --------------------------------------------------
const deleteAllDeletedSpecialties = async (req, res) => {
    try {
        const data = await specialtyService.deleteAllDeletedSpecialties()
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDeletedList.ejs`,
            pageTitle: 'Quản lý chuyên khoa',
            EC: data.EC,
            deletedspecialties: data.DT.deletedSpecialties,
            EM: data.EM
        })
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
const restoreSpecialty = async (req, res) => {
    try {
        const specialtyId = req.body.specialtyId;
        const data = await specialtyService.restoreSpecialty(specialtyId)
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDetail.ejs`,
            pageTitle: 'Quản lý chuyên khoa',
            EC: data.EC,
            specialty: data.DT.specialty,
            doctors: data.DT.doctors,
            EM: data.EM
        })
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
// const restoreAllSpecialties = async (req, res) => {
//     try {
//         const specialtyId = req.body.specialtyId;
//         const data = await specialtyService.restoreSpecialty(specialtyId)
//         return res.render('layouts/layout', {
//             page: `pages/specialties/specialtyDetail.ejs`,
//             pageTitle: 'Quản lý chuyên khoa',
//             EC: data.EC,
//             specialty: data.DT,
//             EM: data.EM
//         })
//     } catch (error) {
//         console.error(error);
        // return res.render('layouts/layout', {
        //     page: 'pages/errorPage.ejs',
        //     pageTitle: 'Lỗi 404',
        //     EM: "Lỗi server ...",
        //     EC: -1,
        // })
//     }
// }

// --------------------------------------------------
const addDoctorsToSpecialty  = async (req, res) => {
    try {
        let { specialtyId, selectedDoctors } = req.body;
        if (!specialtyId || !selectedDoctors || !Array.isArray(selectedDoctors) || selectedDoctors.length === 0) {
            return res.status(400).json({ EM: "Dữ liệu không hợp lệ. Vui lòng chọn ít nhất một bác sĩ.", EC: -1, DT: {} });
        }
        const formattedSpecialtyId = parseInt(specialtyId);
        const formattedDoctorIds = selectedDoctors.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (isNaN(formattedSpecialtyId) || formattedDoctorIds.length === 0) {
            return { EM: "Dữ liệu không hợp lệ sau khi chuẩn hóa.", EC: -1, DT: [] }}
        const result = await specialtyService.addDoctorsToSpecialtyInDB(formattedSpecialtyId, formattedDoctorIds);
        const data = await specialtyService.getSpecialtyById(specialtyId)
        return res.render('layouts/layout', {
            page: `pages/specialties/specialtyDetail.ejs`,
            pageTitle: 'Chi tiết chuyên khoa',
            EC: result.EC,
            EM: result.EM,
            specialty: data.DT.specialty,
            doctors: data.DT.doctors,
            doctorOfSpecialty: data.DT.doctorOfSpecialty,
        })
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
            DT: []
        })
    }
}

// --------------------------------------------------
export default {
    renderSpecialtiesPage, 
    renderSpecialtyDetailPage,
    renderDeletedSpecialtyListPage,

    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    deleteAllDeletedSpecialties,
    restoreSpecialty,
    addDoctorsToSpecialty 
}