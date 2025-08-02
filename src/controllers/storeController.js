import storeService from "../services/newservices/storeService.js";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await storeService.getAllStore(page);
        if (result.EC === 0) {
            return res.render('layouts/layout', {
                page: 'pages/storeListPage.ejs',
                pageTitle: 'Danh sách cửa hàng',
                stores: result.DT.stores,
                totalStores: result.DT.total,
                totalPages: result.DT.totalPages,
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
        console.error('Lỗi khi lấy danh sách cửa hàng:', error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: 'Không thể tải danh sách cửa hàng.',
            EC: -1
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddStorePage = async (req, res) => {
    try {
        return res.render('layouts/layout', {
            page: 'pages/addStorePage.ejs',
            pageTitle: 'Thêm cửa hàng',
        });
    } catch (error) {
        console.error("Lỗi khi render trang thêm cửa hàng:", error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: "Không thể tải trang thêm cửa hàng.",
            EC: -1
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreDetailPage = async (req, res) => {
	try {
		const storeId = req.params.id;
		const result = await storeService.getStoreById(storeId);
		if (result.EC === 0) {
                return res.render('layouts/layout', {
                page: 'pages/storeDetailPage.ejs',
                pageTitle: 'Chi tiết cửa hàng',
                store: result.DT,
                EM: result.EM,
                EC: result.EC
            });
		} else {
            return res.status(404).render('layouts/layout', {
                page: 'pages/errorPage.ejs',
                pageTitle: 'Không tìm thấy cửa hàng',
                EM: result.EM,
                EC: result.EC
            });
        }
	} catch (error) {
		console.error(error);
		res.status(500).render('admin/500', { message: 'Lỗi khi tải chi tiết cửa hàng.' });
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderStoreListByQuery = async (req, res) => {
    try {
        const keyword = req.query.q?.trim() || '';
        console.log('🔍 Từ khóa tìm kiếm:', keyword);
        if (!keyword) {
            return res.render('layouts/layout', {
                page: 'pages/StoreListPage.ejs',
                pageTitle: 'Tìm kiếm kỹ thuật viên',
                Stores: [],
                query: '',
                EM: 'Không có từ khóa tìm kiếm.',
                EC: 1,
            });
        }

        const result = await storeService.searchStore(keyword);

        return res.render('layouts/layout', {
            page: 'pages/StoreListPage.ejs',
            pageTitle: 'Kết quả tìm kiếm kỹ thuật viên',
            Stores: result.DT.Stores || [],
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
const handleAddStore = async (req, res) => {
    try {
        console.log('📥 Dữ liệu form:', req.body);
        console.log('🖼️ Ảnh upload:', req.file);

        if (!req.body || Object.keys(req.body).length === 0) {
            console.warn('⚠️ Không nhận được dữ liệu từ form!');
            return res.status(400).render('layouts/layout', {
                page: 'pages/addStorePage.ejs',
                pageTitle: 'Thêm cửa hàng',
                EM: 'Không nhận được dữ liệu từ form.',
                EC: -1,
            });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await storeService.createStore(req.body, imagePath);

        if (result.EC === 0) {
            return res.redirect('/admin/cua-hang/danh-sach');
        } else {
            return res.status(400).render('layouts/layout', {
                page: 'pages/addStorePage.ejs',
                pageTitle: 'Thêm cửa hàng',
                EM: result.EM,
                EC: result.EC,
            });
        }
    } catch (error) {
        console.error("Lỗi khi thêm cửa hàng:", error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: "Không thể thêm cửa hàng.",
            EC: -1
        });
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    renderAddStorePage,
    renderStoreDetailPage,
    renderStoreListByQuery,
    renderStoreListPage,
    handleAddStore
};