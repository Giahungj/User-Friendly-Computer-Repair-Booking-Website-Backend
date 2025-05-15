import userServices from '../services/userService';
import homeServices from '../services/homeService';
import facilityApiService from '../services/facilityApiService';
import { searchDoctorsService, searchSpecialtiesService, searchFacilitiesService } from "../services/searchApiService";

// --------------------------------------------------
const getHomePage = async (req, res) => {
    let servicedata = await homeServices.getServiceReport();
    let bookingdata = await homeServices.getBookingReport();
    let scheduledata = await homeServices.getScheduleReport();
    let serviceChartData = await homeServices.getServiceChartData();
    let bookingChartData = await homeServices.getBookingChartData();
    let facilities = await facilityApiService.getFacilityList();
    return res.render('layouts/layout', {
        page: `pages/dashboard`,
        pageTitle: 'Dashboard',
        facilities: facilities.DT,
        servicedata: servicedata.DT,
        bookingdata: bookingdata.DT,
        scheduledata: scheduledata.DT,
        serviceChartData: serviceChartData.DT,
        bookingChartData: bookingChartData.DT,
    })
}

// --------------------------------------------------
const getUserPage = async (req, res) => {
    let users = await userServices.getAllUser();
    return res.render('layouts/layout', {
        page: `pages/users/user`,
        pageTitle: 'Manager users',
        users: users
    })
}

// --------------------------------------------------
const getDoctorPage = async (req, res) => {
    let doctors = await userServices.getAllDoctor();
    return res.render('layouts/layout', {
        page: `pages/doctor`,
        pageTitle: 'Manager doctor',
        doctors: doctors
    })
}

// --------------------------------------------------
const getSiteintroPage = async (req, res) => {
    let doctors = await userServices.getAllDoctor();
    return res.render('layouts/layout', {
        page: `pages/site-intro-page`,
        pageTitle: 'Manager doctor'
    })
}


// --------------------------------------------------
const handleCreateNewDoctor = async (req, res) => {
    try {
        let data = await userServices.createNewDoctor(req.body)
        res.redirect("/doctor")
        return data
    } catch (error) {
        return res.send(error)
    }

}

// --------------------------------------------------
const getUpdateDoctorPage = async (req, res) => {
    let specialties = await userServices.getAllSpecialty();
    let facilities = await userServices.getAllFacility();

    let doctor = await userServices.getDoctorById(req.params.id)

    return res.render('layouts/layout', {
        page: `pages/editDoctor`,
        pageTitle: 'Edit doctor',
        specialties: specialties,
        facilities: facilities,
        doctor: doctor
    })
}

// --------------------------------------------------
const handleUpdateDoctor = async (req, res) => {
    let id = req.params.id;
    await userServices.UpdateDoctorInfor(req.body, id);
    res.redirect("/doctor")
}

// --------------------------------------------------
const handleDeleteDoctor = async (req, res) => {
    let id = req.params.id;
    await userServices.deleteDoctorById(id);
    res.redirect("/doctor")
}

// --------------------------------------------------
const handleCreateNewUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const address = req.body.address;

    userServices.createNewUser(email, password, username, address)

    return res.redirect('back');
}

// --------------------------------------------------
const handleDeleteNewUser = async (req, res) => {
    let id = req.params.id;
    await userServices.deleteUser(id);

    return res.redirect('back');
}

// --------------------------------------------------
const getUpdateUserPage = async (req, res) => {
    let id = req.params.id;
    let user = await userServices.getUserById(id);
    return res.render('updateUser', { user })
}

// --------------------------------------------------
const postUpdateUser = async (req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let address = req.body.address;
    let id = req.body.id;
    await userServices.updateUserInfor(email, username, address, id)
    return res.redirect("/user")
}

// --------------------------------------------------
const render404Page = async (req, res) => {
    return res.render('layouts/layout', {
        pageTitle: 'Không tìm thấy',
        page: 'pages/error404Page.ejs',
        EC: -1,
        EM: 'Trang không tồn tại!',
        DT: []
    })
}

// --------------------------------------------------
const renderSearchResultsPage = async (req, res) => {
    try {
        const keyword = req.query.q?.trim() || ''; // Retrieve the search keyword

        console.log('[Search Request]', { keyword });

        const doctorResult = await searchDoctorsService(keyword);
        const specialtyResult = await searchSpecialtiesService(keyword);
        const facilityResult = await searchFacilitiesService(keyword);

        console.log('[Doctors Result]', doctorResult);
        console.log('[Specialties Result]', specialtyResult);
        console.log('[Facilities Result]', facilityResult);

        return res.render('layouts/layout', {
            page: `pages/searchResultPage.ejs`,
            pageTitle: `Kết quả tìm kiếm`,
            keyword,
            doctors: doctorResult.DT || [], // Display doctors data
            specialties: specialtyResult.DT || [], // Display specialties data
            facilities: facilityResult.DT || [], // Display facilities data
            EC: doctorResult.EC, // Status code for doctors
            EM: doctorResult.EM, // Error message for doctors
        });
    } catch (error) {
        console.error(error);

        // Handle errors
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        });
    }
};

// --------------------------------------------------
export default {
    renderSearchResultsPage,
    getHomePage, getUserPage, handleCreateNewUser, handleDeleteNewUser, getUpdateUserPage, postUpdateUser,
    getDoctorPage, getSiteintroPage, handleCreateNewDoctor, getUpdateDoctorPage, handleUpdateDoctor,
    handleDeleteDoctor,
    render404Page
}