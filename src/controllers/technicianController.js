import technicianService from "../services/newservices/technicianService.js";
import storeService from "../services/newservices/storeService.js";
import specialtyService from "../services/newservices/specialtyService.js";
import repairBookingService from "../services/newservices/repairBookingService.js";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q?.trim() || '';
		const result = await technicianService.getAllTechnician(page, searchQuery);

		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/technician/technicianListPage.ejs',
				pageTitle: 'Danh sách kỹ thuật viên',
				technicians: result.DT.technicians,
				totalTechnicians: result.DT.total,
				totalPages: result.DT.totalPages,
				currentPage: page,
				searchQuery: searchQuery,
				EM: result.EM,
				EC: result.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Kỹ thuật viên', active: true },
				],
			});
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: result.EM,
				EC: result.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Kỹ thuật viên', url: '/ky-thuat-vien/danh-sach' },
					{ name: 'Lỗi', active: true },
				],
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách kỹ thuật viên.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderChangeStorePage = async (req, res) => {
	try {
		const page = 1;
		const searchQuery = '';
		const getAll = true
		const {technicianId} = req.params;
		if (!technicianId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu technicianId.',
				EC: -1
			});
		}
		const technicianData = await technicianService.getTechnicianById(technicianId);
		const storeData = await storeService.getAllStore(page, searchQuery, getAll);

		if (technicianData.EC === 0 && storeData.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/technician/changeStorePage.ejs',
				pageTitle: 'Đổi cửa hàng của Kỹ thuật Viên',
				technicianData: technicianData.DT,
				storeData: storeData.DT.stores,
				EM: technicianData.EM,
				EC: technicianData.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Kỹ thuật viên', url: '/admin/ky-thuat-vien/danh-sach' },
					{ name: technicianData.DT.User?.name || `Mã ${technicianId}`, url: `/admin/ky-thuat-vien/${technicianId}/chi-tiet` },
					{ name: 'Đổi cửa hàng', url: '', active: true }
				]
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy kỹ thuật viên.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách kỹ thuật viên.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleChangeStorePage = async (req, res) => {
	try {
		const { technicianId } = req.params;
		const storeId = req.body.store_id;

		console.log('[ChangeStore] Received params:', { technicianId, storeId });

		if (!technicianId || !storeId) {
			console.log('[ChangeStore] Missing technicianId or storeId');
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu technicianId hoặc storeId.',
				EC: -1
			});
		}

		// Thực hiện đổi cửa hàng
		console.log('[ChangeStore] Attempting to change store...');
		const changeResult = await technicianService.changeTechnicianStore(technicianId, storeId);
		console.log('[ChangeStore] Change store result:', changeResult);

		if (changeResult.EC !== 0) {
			console.log('[ChangeStore] Change store failed');
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: changeResult.EM || 'Không tìm thấy kỹ thuật viên.',
				EC: changeResult.EC
			});
		}

		// Lấy kỹ thuật viên và bookings song song
		console.log('[ChangeStore] Fetching technician details and bookings...');
		const [technicianResult, bookingsResult] = await Promise.all([
			technicianService.getTechnicianById(technicianId),
			repairBookingService.getBookingsByTechnicianId(technicianId)
		]);
		console.log('[ChangeStore] Technician result:', technicianResult);
		console.log('[ChangeStore] Bookings result:', bookingsResult);

		if (technicianResult.EC !== 0) {
			console.log('[ChangeStore] Technician not found after change');
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: technicianResult.EM || 'Không tìm thấy kỹ thuật viên.',
				EC: technicianResult.EC
			});
		}

		// Gán bookings nếu lấy thành công
		technicianResult.DT.Bookings = bookingsResult.EC === 0 ? bookingsResult.DT : [];
		console.log('[ChangeStore] Final technician data with bookings:', technicianResult.DT);

		// Render trang chi tiết kỹ thuật viên
		return res.render('layouts/layout', {
			page: 'pages/technician/technicianDetailPage.ejs',
			pageTitle: 'Chi tiết kỹ thuật viên',
			data: technicianResult.DT,
			EM: technicianResult.EM,
			EC: technicianResult.EC,
			breadcrumbs: [
				{ name: 'Trang chủ', url: '/' },
				{ name: 'Kỹ thuật viên', url: '/admin/ky-thuat-vien/danh-sach' },
				{ name: technicianResult.DT.User?.name || `Mã ${technicianId}`, url: '' }
			]
		});
	} catch (error) {
		console.error('Lỗi khi đổi cửa hàng cho kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi',
			EM: 'Không thể đổi cửa hàng cho kỹ thuật viên.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddTechnicianPage = async (req, res) => {
	try {
		const stores = await storeService.getAllStore();
		const specialties = await specialtyService.getAllSpecialties();
		return res.render('layouts/layout', {
			page: 'pages/technician/addTechnicianPage.ejs',
			pageTitle: 'Danh sách kỹ thuật viên',
			stores: stores.DT.stores || [],
			specialties: specialties.DT.specialties || [],
		});
	} catch (error) {
		console.error("Lỗi khi render trang thêm kỹ thuật viên:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage	.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang thêm kỹ thuật viên.",
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianListByQuery = async (req, res) => {
	try {
		const keyword = req.query.q?.trim() || '';
		if (!keyword) {
			return res.render('layouts/layout', {
				page: 'pages/technician/technicianListPage.ejs',
				pageTitle: 'Tìm kiếm kỹ thuật viên',
				technicians: [],
				query: '',
				EM: 'Không có từ khóa tìm kiếm.',
				EC: 1,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Kỹ thuật viên', url: '/technicians' },
					{ name: 'Tìm kiếm', active: true },
				],
			});
		}

		const result = await technicianService.searchTechnician(keyword);

		return res.render('layouts/layout', {
			page: 'pages/technician/technicianListPage.ejs',
			pageTitle: 'Kết quả tìm kiếm kỹ thuật viên',
			technicians: result.DT.technicians || [],
			query: keyword,
			currentPage: parseInt(req.query.page) || 1,
			totalPages: result.DT?.totalPages || 1,
			breadcrumbs: [
				{ name: 'Trang chủ', url: '/' },
				{ name: 'Kỹ thuật viên', url: '/technicians' },
				{ name: `Kết quả cho "${keyword}"`, active: true },
			],
		});
	} catch (error) {
		console.error("Lỗi khi render trang tìm kiếm kỹ thuật viên:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang tìm kiếm kỹ thuật viên.",
			EC: -1,
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleAddTechnician = async (req, res) => {
	try {
		console.log('📥 Dữ liệu form:', req.body);
		console.log('🖼️ Ảnh upload:', req.file);
		const stores = await storeService.getAllStore();
		const specialties = await specialtyService.getAllSpecialties();

		if (!req.body || Object.keys(req.body).length === 0) {
			console.warn('⚠️ Không nhận được dữ liệu từ form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/technician/addTechnicianPage.ejs',
				pageTitle: 'Thêm kỹ thuật viên',
				EM: 'Không nhận được dữ liệu từ form.',
				EC: -1,
				stores: stores.DT.stores || [],
				specialties: specialties.DT.specialties || [],
			});
		}

		if (!req.body.password) {
			console.warn('⚠️ Thiếu mật khẩu trong form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/technician/addTechnicianPage.ejs',
				pageTitle: 'Thêm kỹ thuật viên',
				EM: 'Thiếu mật khẩu.',
				EC: -1,
				stores: stores.DT.stores || [],
				specialties: specialties.DT.specialties || [],
			});
		}

		const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

		const result = await technicianService.createTechnician(req.body, avatarPath);

		if (result.EC === 0) {
			return res.redirect('/admin/ky-thuat-vien/danh-sach');
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/technician/addTechnicianPage.ejs',
				pageTitle: 'Thêm kỹ thuật viên',
				EM: result.EM,
				EC: result.EC,
				stores: stores.DT.stores || [],
				specialties: specialties.DT.specialties || [],
			});
		}
	} catch (error) {
		console.error("Lỗi khi thêm kỹ thuật viên:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể thêm kỹ thuật viên.",
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianDetailPage = async (req, res) => {
	try {
		const technicianId = req.params.id;
		if (!technicianId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu technician_id.',
				EC: -1
			});
		}
		const result = await technicianService.getTechnicianById(technicianId);
		const bookings = await repairBookingService.getBookingsByTechnicianId(technicianId);
		result.DT.Bookings = bookings.DT;
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/technician/technicianDetailPage.ejs',
				pageTitle: 'Chi tiết kỹ thuật viên',
				data: result.DT,
				EM: result.EM,
				EC: result.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Kỹ thuật viên', url: '/admin/ky-thuat-vien/danh-sach' },
					{ name: result.DT.User?.name || `Mã ${technicianId}`, url: '', active: true }
				]
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy kỹ thuật viên.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy chi tiết kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải chi tiết kỹ thuật viên.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderTechnicianListPage,
	renderAddTechnicianPage,
	renderTechnicianDetailPage,
	renderTechnicianListByQuery,
	renderChangeStorePage,
	handleChangeStorePage,
	handleAddTechnician
};