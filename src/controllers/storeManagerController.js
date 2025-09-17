import storeManagerService from '../services/newservices/storeManagerService.js';
import storeService from '../services/newservices/storeService.js';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreManagerListPage = async (req, res) => {
	try {
        const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q || '';
		const result = await storeManagerService.getAllStoreManager(page, searchQuery);
		console.log('📋 Kết quả lấy danh sách cửa hàng trưởng:', result.DT.managers);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/storeManagerListPage.ejs',
				pageTitle: 'Danh sách cửa hàng trưởng',
				managers: result.DT.managers,
				totalManagers: result.DT.total,
				totalPages: result.DT.totalPages,
				searchQuery: searchQuery,
				currentPage: page,
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
		console.error('Lỗi khi lấy danh sách cửa hàng trưởng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách cửa hàng trưởng.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddStoreManagerPage = async (req, res) => {
	try {
		const stores = await storeService.getAllStore();
		return res.render('layouts/layout', {
			page: 'pages/addStoreManagerPage.ejs',
			pageTitle: 'Thêm cửa hàng trưởng',
			stores: stores.DT || []
		});
	} catch (error) {
		console.error("Lỗi khi render trang thêm cửa hàng trưởng:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang thêm cửa hàng trưởng.",
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleAddStoreManager = async (req, res) => {
	try {
		console.log('📥 Dữ liệu form:', req.body);
		console.log('🖼️ Ảnh upload:', req.file);

		if (!req.body || Object.keys(req.body).length === 0) {
			console.warn('⚠️ Không nhận được dữ liệu từ form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: 'Không nhận được dữ liệu từ form.',
				EC: -1,
				stores: (await storeService.getAllStore()).DT || []
			});
		}

		if (!req.body.password) {
			console.warn('⚠️ Thiếu mật khẩu trong form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: 'Thiếu mật khẩu.',
				EC: -1,
				stores: (await storeService.getAllStore()).DT || []
			});
		}

		const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

		const result = await storeManagerService.createStoreManager(req.body, avatarPath);

		if (result.EC === 0) {
			return res.redirect('/admin/cua-hang-truong/danh-sach');
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: result.EM,
				EC: result.EC,
				stores: (await storeService.getAllStore()).DT || []
			});
		}
	} catch (error) {
		console.error("Lỗi khi thêm cửa hàng trưởng:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể thêm cửa hàng trưởng.",
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreManagerDetailPage = async (req, res) => {
	try {
		const storeManagerId = req.params.id;
		if (!storeManagerId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu store_manager_id.',
				EC: -1
			});
		}
		const result = await storeManagerService.getStoreManagerById(storeManagerId);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/storeManagerDetailPage.ejs',
				pageTitle: 'Chi tiết quản lý cửa hàng',
				storeManager: result.DT,
				EM: result.EM,
				EC: result.EC
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy quản lý cửa hàng.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy chi tiết quản lý cửa hàng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải chi tiết quản lý cửa hàng.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// const renderStoreManagerDetailPage = async (req, res) => {
// 	try {
// 		const managerId = req.params.id;
// 		if (!managerId) {
// 			return res.status(400).render('layouts/layout', {
// 				page: 'pages/errorPage.ejs',
// 				pageTitle: 'Lỗi',
// 				EM: 'Thiếu store_manager_id.',
// 				EC: -1
// 			});
// 		}

// 		const result = await storeManagerService.getStoreManagerById(managerId);

// 		if (result.EC === 0) {
// 			return res.render('layouts/layout', {
// 				page: 'pages/storeManagerDetailPage.ejs',
// 				pageTitle: 'Chi tiết cửa hàng trưởng',
// 				manager: result.DT,
// 				EM: result.EM,
// 				EC: result.EC
// 			});
// 		} else {
// 			return res.status(404).render('layouts/layout', {
// 				page: 'pages/errorPage.ejs',
// 				pageTitle: 'Không tìm thấy',
// 				EM: result.EM || 'Không tìm thấy cửa hàng trưởng.',
// 				EC: result.EC
// 			});
// 		}
// 	} catch (error) {
// 		console.error('Lỗi khi lấy chi tiết cửa hàng trưởng:', error);
// 		return res.status(500).render('layouts/layout', {
// 			page: 'pages/errorPage.ejs',
// 			pageTitle: 'Lỗi 500',
// 			EM: 'Không thể tải chi tiết cửa hàng trưởng.',
// 			EC: -1
// 		});
// 	}
// };
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderStoreManagerListPage,
	renderAddStoreManagerPage,
	handleAddStoreManager,
	renderStoreManagerDetailPage
};
