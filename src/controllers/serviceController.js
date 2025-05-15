import serviceService from '../services/serviceService.js'

// --------------------------------------------------
const renderPendingServicesPage = async (req, res) => {
    try {
        let data = await serviceService.getPendingServiceList()
        return res.render('layouts/layout', {
            page: `pages/doctorservice/managerDoctorService.ejs`,
            pageTitle: 'Phê duyệt gói dịch vụ',
            data: data.DT,
            message: data.EM,
            EC: data.EC
        })
    } catch (error) {
        console.error(error)
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const renderEditDoctorServicePage = async (req, res) => {
    try {
        const { doctorServiceId } = req.query;
        let data = await serviceService.getDoctorServiceDetails(doctorServiceId)
        console.log("data", data)
        return res.render('layouts/layout', {
            page: `pages/doctorservice/editDoctorServicePage.ejs`,
            pageTitle: 'Chi tiết gói dịch vụ',
            data: data.DT,
            message: data.EM,
            EC: data.EC
        })
    } catch (error) {
        console.error(error)
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const approveServices = async (req, res) => {
    try {
        const doctorServiceId = req.body.doctorServiceId; // Mảng chứa các ID dịch vụ được chọn

        // Log serviceIds để kiểm tra giá trị nhận được từ client
        console.log('Received service IDs:', doctorServiceId);

        if (!doctorServiceId) {
            console.log('No services selected'); // Log nếu không có dịch vụ nào được chọn
            return res.status(400).json({ EC: -1, EM: 'Không có dịch vụ nào được chọn' });
        }

        // Log trước khi gọi service để duyệt dịch vụ
        console.log('Approving services:', doctorServiceId);

        // Gọi service để duyệt các dịch vụ
        let result = await serviceService.approveServices(doctorServiceId);

        // Log kết quả trả về từ service
        console.log('Approval result:', result);

        if (result.EC === 0) {
            return res.status(200).json({ EC: 0, EM: 'Duyệt dịch vụ thành công' });
        } else {
            console.log('Error in approving services'); // Log khi có lỗi trong quá trình duyệt
            return res.status(500).json({ EC: -1, EM: 'Lỗi trong quá trình duyệt dịch vụ' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server ...' });
    }
}

// --------------------------------------------------
const terminateService = async (req, res) => {
    try {
        const doctorServiceId = req.body.doctorServiceId; // Mảng chứa các ID dịch vụ được chọn

        // Log serviceIds để kiểm tra giá trị nhận được từ client
        console.log('Received service IDs:', doctorServiceId);

        if (!doctorServiceId) {
            console.log('No services selected'); // Log nếu không có dịch vụ nào được chọn
            return res.status(400).json({ EC: -1, EM: 'Không có dịch vụ nào được chọn' });
        }

        // Log trước khi gọi service để duyệt dịch vụ
        console.log('Terminating services:', doctorServiceId);

        // Gọi service để duyệt các dịch vụ
        let result = await serviceService.terminateService(doctorServiceId);

        // Log kết quả trả về từ service
        console.log('Termination result:', result);

        if (result.EC === 0) {
            return res.status(200).json({ EC: 0, EM: 'Ngừng dịch vụ thành công' });
        } else {
            console.log('Error in terminating services'); // Log khi có lỗi trong quá trình duyệt
            return res.status(500).json({ EC: -1, EM: result.EM });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server ...' });
    }
}

// --------------------------------------------------
export default { 
    renderPendingServicesPage,
    renderEditDoctorServicePage,
    approveServices,
    terminateService,
}