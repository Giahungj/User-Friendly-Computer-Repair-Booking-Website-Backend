import repairBookingService from '../services/newservices/repairBookingService.js';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderRepairBookingListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q || '';
		const filters = {
			device_type: req.query.device_type || '',
			brand: req.query.brand || '',
			booking_date: req.query.booking_date || '',
			booking_time: req.query.booking_time || '',
			status: req.query.status || ''
		};
		const result = await repairBookingService.getAllRepairBooking(page, searchQuery, filters);
		
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/repair-booking/repairBookingListPage.ejs',
				pageTitle: 'Danh sách lịch sửa chữa',
				bookings: result.DT.bookings,
				totalBookings: result.DT.total,
				totalPages: result.DT.totalPages,
				searchQuery: searchQuery,
				filters,
				currentPage: page,
				EM: result.EM,
				EC: result.EC
			});
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: result.EM,
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy danh sách lịch sửa chữa:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách lịch sửa chữa.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderRepairBookingDetailPage = async (req, res) => {
	try {
		const bookingId = req.params.id;
		if (!bookingId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu booking_id.',
				EC: -1
			});
		}
		const result = await repairBookingService.getRepairBookingById(bookingId);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/repair-booking/repairBookingDetailPage.ejs',
				pageTitle: 'Chi tiết đơn đặt lịch',
				repairBooking : result.DT.bookingData,
				customerData: result.DT.customerData,
				workScheduleData: result.DT.workScheduleData,
				technicianData: result.DT.technicianData,	
				storeData: result.DT.storeData,
				managerData: result.DT.managerData,
				historyData: result.DT.historyData,
				EM: result.EM,
				EC: result.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Đơn đặt lịch', url: '/admin/dat-lich/danh-sach' },
					{ name: `Đơn của khách hàng ${result.DT.customerData.User?.name}` || `Mã ${bookingId}`, url: '', active: true }
				]
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy đơn đặt lịch.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy chi tiết đơn đặt lịch:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải chi tiết đơn đặt lịch.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    renderRepairBookingListPage,
	renderRepairBookingDetailPage
};