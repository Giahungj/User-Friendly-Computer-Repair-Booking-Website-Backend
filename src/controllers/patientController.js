import { console } from 'inspector';
import db from '../models/index';
import { Op } from 'sequelize';
import patientService from '../services/patientService'
import ratingService from '../services/ratingService'

// --------------------------------------------------
const renderPatientsPage = async (req, res) => {
    // Lấy searchTerm từ URL
    const { searchTerm = '' } = req.query;

    // Điều kiện tìm kiếm
    const where = {};
    if (searchTerm) {
        where[Op.or] = [
            { '$User.name$': { [Op.like]: `%${searchTerm}%` } } // Tìm kiếm gần đúng trên tên
        ];
    }

    // Lấy danh sách bệnh nhân
    const patients = await db.Patient.findAll({
        where,
        include: [{ model: db.User }],
        raw: true,
        nest: true
    });

    // Định dạng giới tính
    patients.forEach(p => {
        p.sex = p.User.sex === 1 ? 'Nam' : p.User.sex === 0 ? 'Nữ' : 'Chưa xác định';
        console.log(p.id, p.sex);
    });

    // Lấy dữ liệu từ patientService (giả sử trả về dữ liệu bổ sung)
    const patientdata = await patientService.getPatients();
    console.log('====================================================================================================', patients.length)
    return res.render('layouts/layout', {
        page: `pages/patients/patientList.ejs`,
        pageTitle: 'Patient Manager',
        patients,
        patientdata: patientdata.DT,
        searchTerm
    });
};

// -----------------------------------------------------
const renderPatientDetailPage = async (req, res) => {
    const patientId = req.params.id
    const page = parseInt(req.query.page || 1)
    const data = await patientService.getPatientById(patientId, page)
    const ratings = await ratingService.getPatientRatings(patientId)
    return res.render('layouts/layout', {
        page: `pages/patients/patientDetail.ejs`,
        pageTitle: 'Chi tiết bệnh nhân',
        currentPage: page,
        totalPages: data.DT.total,
        EM: data.EM,
        EC: data.EC,
        baseUrl: '/patient-detail',
        patient: data.DT.patient,
        bookings: data.DT.bookings,
        historys: data.DT.historys,
        ratings: ratings.DT
    })
}

// --------------------------------------------------
export default {
    renderPatientsPage,
    renderPatientDetailPage
}