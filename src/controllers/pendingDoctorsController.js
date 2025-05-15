import pendingDoctorsApiService from '../services/pendingDoctorsApiService'
import doctorApiService from '../services/doctorApiService'

// --------------------------------------------------
const renderPendingDoctorsPage = async (req, res) => {
    try {
        let data = await pendingDoctorsApiService.getPendingDoctorList()
        return res.render('layouts/layout', {
            page: `partials/pendingdoctors/pendingDoctorListTable.ejs`,
            pageTitle: 'Phê duyệt bác sĩ',
            data: data.DT,
            message: data.EM,
            EC: data.EC
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
const handlePendingDoctors = async (req, res) => {
    try {
        let data = req.body
        if (data.action === '1') {
            data = await pendingDoctorsApiService.approve(data)
        } else {
            data = await pendingDoctorsApiService.reject(data)
        }
        return res.render('layouts/layout', {
            page: `partials/pendingdoctors/pendingDoctorListTable.ejs`,
            pageTitle: 'Phê duyệt bác sĩ',
            data: data
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
export default { renderPendingDoctorsPage, handlePendingDoctors }