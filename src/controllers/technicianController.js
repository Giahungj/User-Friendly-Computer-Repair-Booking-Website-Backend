import technicianService from "../services/newservices/technicianService.js";
import storeService from "../services/newservices/storeService.js";
import specialtyService from "../services/newservices/specialtyService.js";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q?.trim() || '';
		const result = await technicianService.getAllTechnician(page, searchQuery);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/technicianListPage.ejs',
				pageTitle: 'Danh sách kỹ thuật viên',
				technicians: result.DT.technicians,
				totalTechnicians: result.DT.total,
				totalPages: result.DT.totalPages,
				currentPage: 1,
				searchQuery: searchQuery,
				EM: result.EM,
				EC: result.EC
			});
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: result.EM,
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách kỹ thuật viên.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddTechnicianPage = async (req, res) => {
	try {
		const stores = await storeService.getAllStore();
		const specialties = await specialtyService.getAllSpecialties();
		return res.render('layouts/layout', {
			page: 'pages/addTechnicianPage.ejs',
			pageTitle: 'Danh sách kỹ thuật viên',
			stores: stores.DT.stores || [],
			specialties: specialties.DT.specialties || [],
		});
	} catch (error) {
		console.error("Lỗi khi render trang thêm kỹ thuật viên:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage	.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang thêm kỹ thuật viên.",
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianListByQuery = async (req, res) => {
	try {
		const keyword = req.query.q?.trim() || '';
		console.log('🔍 Từ khóa tìm kiếm:', keyword);
		if (!keyword) {
			return res.render('layouts/layout', {
				page: 'pages/technicianListPage.ejs',
				pageTitle: 'Tìm kiếm kỹ thuật viên',
				technicians: [],
				query: '',
				EM: 'Không có từ khóa tìm kiếm.',
				EC: 1,
			});
		}

		const result = await technicianService.searchTechnician(keyword);

		return res.render('layouts/layout', {
			page: 'pages/technicianListPage.ejs',
			pageTitle: 'Kết quả tìm kiếm kỹ thuật viên',
			technicians: result.DT.technicians || [],
			query: keyword,
			currentPage: parseInt(req.query.page) || 1,
			totalPages: result.DT?.totalPages || 1,
		});
	} catch (error) {
		console.error("Lỗi khi render trang tìm kiếm kỹ thuật viên:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang tìm kiếm kỹ thuật viên.",
			EC: -1,
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
				page: 'pages/addTechnicianPage.ejs',
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
				page: 'pages/addTechnicianPage.ejs',
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
				page: 'pages/addTechnicianPage.ejs',
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
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể thêm kỹ thuật viên.",
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTechnicianDetailPage = async (req, res) => {
	try {
		const technicianId = req.params.id;
		if (!technicianId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu technician_id.',
				EC: -1
			});
		}
		const result = await technicianService.getTechnicianById(technicianId);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/technicianDetailPage.ejs',
				pageTitle: 'Chi tiết kỹ thuật viên',
				technician: result.DT,
				EM: result.EM,
				EC: result.EC
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy kỹ thuật viên.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy chi tiết kỹ thuật viên:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải chi tiết kỹ thuật viên.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderTechnicianListPage,
	renderAddTechnicianPage,
	renderTechnicianDetailPage,
	renderTechnicianListByQuery,
	handleAddTechnician
};