import db from '../models/index';
import doctorService from '../services/doctorService'
import facilityService from '../services/facilityApiService'
import specialtyService from '../services/specialtyService';
import ratingService from '../services/ratingService';

// --------------------------------------------------
const renderManagerDoctorPage = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let result = await doctorService.getAllDoctors(page, 10);

        if (result.EC === 0) {
            return res.render('layouts/layout', {
                page: `pages/doctors/managerDoctorPage.ejs`,
                pageTitle: 'Quản lý bác sĩ',
                doctors: result.DT.data, 
                totalDoctors: result.DT.total,
                message: result.EM,
                EC: result.EC,
                currentPage: page,
                totalPages: result.DT.totalPages,
                totalBookingsToday: result.DT.totalBookingsToday,
                bookingsCompleted: result.DT.bookingsCompleted,
                baseUrl: '/manager-doctor'
            });
        } else {
            return res.render('layouts/layout', {
                page: `pages/doctors/managerDoctorPage.ejs`,
                pageTitle: 'Quản lý bác sĩ',
                doctors: [],
                totalDoctors: 0,
                message: result.EM,
                EC: result.EC,
                currentPage: page,
                totalBookingsToday: 0,
                bookingsCompleted: 0,
                totalPages: 0,
                baseUrl: '/manager-doctor'
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
const renderDoctorDetailPage = async (req, res) => {
    try {
        const id = req.params.id
        const page = req.query.page || 1
        let data = await doctorService.getDoctorById(id, page)
        const facilities = await facilityService.getFacilityList()
        const specialties = await specialtyService.getSpecialtyList()
        const filteredSpecialties = specialties.DT.specialties.filter(specialty => specialty.id !== data.DT.doctor.specialtyId);
        const filteredFacilities = facilities.DT.filter(facility => facility.id !== data.DT.doctor.facilityId);
        const ratings = await ratingService.getDoctorRatings(id)
        if (data.EC === 0) {
            return res.render('layouts/layout', {
                page: `pages/doctors/doctorDetailPage.ejs`,
                pageTitle: 'Quản lý bác sĩ',
                EC: data.EC,
                EM: data.EM,
                facilities: filteredFacilities,
                specialties: filteredSpecialties,
                currentPage: page,
                totalPages: data.DT.total,
                totalBookings: data.DT.totalBookings,
                data: data.DT,
                baseUrl: '/doctor-detail',
                ratings: ratings.DT.ratings,
                avgScore: ratings.DT.avgScore,
            })
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
}

// --------------------------------------------------
const switchTheDoctorWorkFacility = async (req, res) => {
    try {
        const { doctorId, facilityId, oldFacilityId } = req.body
        const resuilt = await facilityService.switchTheDoctorWorkFacility(doctorId, facilityId, oldFacilityId)
        if (resuilt.EC === 0) {
            return res.redirect(`/doctor-detail/${doctorId}`)
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
}

// --------------------------------------------------
const switchTheDoctorSpecialty = async (req, res) => {
    try {
        const { doctorId, specialtyId, oldSpecialtyId } = req.body
        const resuilt = await specialtyService.switchTheDoctorSpecialty(doctorId, specialtyId, oldSpecialtyId)
        if (resuilt.EC === 0) {
            return res.redirect(`/doctor-detail/${doctorId}`)
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
}

// --------------------------------------------------
export default {
    renderManagerDoctorPage, 
    renderDoctorDetailPage, 
    switchTheDoctorWorkFacility, 
    switchTheDoctorSpecialty
}