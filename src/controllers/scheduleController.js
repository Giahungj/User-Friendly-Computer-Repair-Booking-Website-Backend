import { where } from 'sequelize/lib/sequelize';
import scheduleService from '../services/scheduleService';
import facilityApiService from '../services/facilityApiService';
import specialtyService from '../services/specialtyService';

// --------------------------------------------------
const createSchedule = async (req, res) => {
    try {
        let fieldData = req.body;
        let { date, doctorId, timeSlotId, maxNumber } = fieldData;
        fieldData.timeSlotId = Array.isArray(timeSlotId) ? timeSlotId : [timeSlotId];
        fieldData.maxNumber = Array.isArray(maxNumber) ? maxNumber : [maxNumber];
        if (!date || !doctorId || fieldData.timeSlotId.length === 0 || fieldData.maxNumber.length === 0) {
            return res.status(200).json({ EM: 'Không tạo được lịch làm việc khi thiếu thông tin!', EC: 1, DT: [] });
        }
        let newSchedule = await scheduleService.createSchedule(fieldData);
        return res.status(200).json({ EM: newSchedule.EM, EC: newSchedule.EC, DT: [] });
    } catch (error) {
        console.error("Lỗi Controller:", error);
        return { EM: "Lỗi máy chủ", EC: -1, DT: [] };
    }
}

// --------------------------------------------------
const renderSchedulePage = async (req, res) => {
    try {
        // Lấy các tham số filter từ query string
        const page = parseInt(req.query.page || 1);  // Lấy số trang (mặc định trang 1)
        const date = req.query.date || '';           // Lấy giá trị ngày
        const facilityId = req.query.facilityId || ''; // Lấy giá trị cơ sở y tế
        const specialtyId = req.query.specialtyId || ''; // Lấy giá trị cơ sở y tế
        const shift = req.query.shift || '';         // Lấy giá trị ca
        const status = req.query.status || '';       // Lấy giá trị trạng thái
        const searchTerm = req.query.searchTerm || ''; // Lấy giá trị tìm kiếm

        // Gửi các tham số lọc vào hàm dịch vụ để lấy dữ liệu
        const data = await scheduleService.getAllSchedule(page, date, facilityId, specialtyId, shift, status, searchTerm);
        const facilities = await facilityApiService.getFacilityList();
        const specialties = await specialtyService.getSpecialtyList();
        // Render trang với dữ liệu đã được lọc
        return res.render('layouts/layout', {
            page: `pages/schedules/managerSchedulePage.ejs`,
            pageTitle: 'Quản lý lịch làm việc',
            schedules: data.DT.schedules,
            facilities: facilities.DT,
            specialties: specialties.DT.specialties,
            currentPage: page,
            totalPages: data.DT.totalPages,
            filterDate: date, // Truyền lại giá trị filter
            filterFacility: facilityId,
            filterShift: shift,
            filterStatus: status,
            filterSearchTerm: searchTerm,
        });
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        });
    }
}


// --------------------------------------------------
export default{
    createSchedule,
    renderSchedulePage,
}