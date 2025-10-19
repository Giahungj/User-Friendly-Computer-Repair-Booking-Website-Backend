import storeManagerService from '../services/newservices/storeManagerService.js';
import storeService from '../services/newservices/storeService.js';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreManagerListPage = async (req, res) => {
	try {
        const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q || '';
		const result = await storeManagerService.getAllStoreManager(page, searchQuery);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/store-manager/storeManagerListPage.ejs',
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
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: result.EM,
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy danh sách cửa hàng trưởng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách cửa hàng trưởng.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddStoreManagerPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const result = await storeService.getStoresSuport(page);
		return res.render('layouts/layout', {
			page: 'pages/store-manager/addStoreManagerPage.ejs',
			pageTitle: 'Thêm cửa hàng trưởng',
			stores: result.DT.stores || []
		});
	} catch (error) {
		console.error("Lỗi khi render trang thêm cửa hàng trưởng:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể tải trang thêm cửa hàng trưởng.",
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderEditStoreManagerPage = async (req, res) => {
	try {
		const storeManagerId = req.params.storeManagerId;
		if (!storeManagerId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu store_manager_id.',
				EC: -1
			});
		}
		const result = await storeManagerService.getStoreManagerById(storeManagerId);
		const storesResult = await storeService.getStoresSuport();
		return res.render('layouts/layout', {
			page: 'pages/store-manager/updateStoreManagerPage.ejs',
			pageTitle: 'Danh sách cửa hàng trưởng',
			manager: result.DT,
			stores: storesResult.DT.stores || [],
		});
	} catch (error) {
		console.error('Lỗi khi lấy danh sách cửa hàng trưởng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách cửa hàng trưởng.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleAddStoreManager = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			console.warn('⚠️ Không nhận được dữ liệu từ form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/store-manager/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: 'Không nhận được dữ liệu từ form.',
				EC: -1,
				stores: (await storeService.getStoresSuport()).DT || []
			});
		}

		if (!req.body.password) {
			console.warn('⚠️ Thiếu mật khẩu trong form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/store-manager/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: 'Thiếu mật khẩu.',
				EC: -1,
				stores: (await storeService.getStoresSuport()).DT || []
			});
		}

		const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

		const result = await storeManagerService.createStoreManager(req.body, avatarPath);

		if (result.EC === 0) {
			return res.redirect('/admin/cua-hang-truong/danh-sach');
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/store-manager/addStoreManagerPage.ejs',
				pageTitle: 'Thêm cửa hàng trưởng',
				EM: result.EM,
				EC: result.EC,
				stores: (await storeService.getStoresSuport()).DT.stores || []
			});
		}
	} catch (error) {
		console.error("Lỗi khi thêm cửa hàng trưởng:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể thêm cửa hàng trưởng.",
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleEditStoreManagerPage = async (req, res) => {
	try {
		const user_id = req.params.user_id;
		const { name, email, phone, store_id } = req.body;

		// Chuẩn bị data
		const data = { name, email, phone, store_id };
		if (req.file) {
			data.avatar = '/uploads/' + req.file.filename;
		}

		const result = await storeManagerService.updateStoreManager(user_id, data);

		res.redirect('/admin/cua-hang-truong/danh-sach');
	} catch (err) {
		console.error(err);
		res.redirect('/admin/cua-hang-truong/danh-sach?em=Lỗi khi cập nhật');
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreManagerDetailPage = async (req, res) => {
	try {
		const storeManagerId = req.params.id;
		if (!storeManagerId) {
			return res.status(400).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: 'Thiếu store_manager_id.',
				EC: -1
			});
		}
		const result = await storeManagerService.getStoreManagerById(storeManagerId);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/store-manager/storeManagerDetailPage.ejs',
				pageTitle: 'Chi tiết quản lý cửa hàng',
				storeManager: result.DT,
				EM: result.EM,
				EC: result.EC,
				breadcrumbs: [
					{ name: 'Trang chủ', url: '/' },
					{ name: 'Cửa hàng trưởng', url: '/admin/cua-hang-truong/danh-sach' },
					{ name: result.DT.User?.name || `Mã ${storeManagerId}`, url: '', active: true }
				]
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/misc/errorPage.ejs',
				pageTitle: 'Không tìm thấy',
				EM: result.EM || 'Không tìm thấy quản lý cửa hàng.',
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi lấy chi tiết quản lý cửa hàng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải chi tiết quản lý cửa hàng.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderStoreManagerListPage,
	renderAddStoreManagerPage,
	renderStoreManagerDetailPage,
	renderEditStoreManagerPage,
	
	handleAddStoreManager,
	handleEditStoreManagerPage,
};
