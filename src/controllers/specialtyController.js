import specialtyService from '../services/newservices/specialtyService.js';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderSpecialtyListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const result = await specialtyService.getAllSpecialties(page);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/specialtyListPage.ejs',
				pageTitle: 'Danh sách chuyên môn',
				specialties: result.DT.specialties,
				totalSpecialties: result.DT.total,
				currentPage: page,
				totalPages: result.DT.totalPages,
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
		console.error('Lỗi khi lấy danh sách chuyên môn:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách chuyên môn.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderAddSpecialtyPage = async (req, res) => {
    try {
        return res.render('layouts/layout', {
            page: 'pages/addSpecialtyPage.ejs',
            pageTitle: 'Thêm chuyên môn kỹ thuật viên',
});
    } catch (error) {
        console.error("Lỗi khi render trang thêm chuyên môn kỹ thuật viên:", error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: "Không thể tải trang thêm chuyên môn kỹ thuật viên.",
            EC: -1,
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleAddSpecialty = async (req, res) => {
	try {
		console.log('📥 Dữ liệu form:', req.body);
		console.log('🖼️ Ảnh upload:', req.file);

		if (!req.body || Object.keys(req.body).length === 0) {
			console.warn('⚠️ Không nhận được dữ liệu từ form!');
			return res.status(400).render('layouts/layout', {
				page: 'pages/addSpecialtyPage.ejs',
				pageTitle: 'Thêm chuyên môn',
				EM: 'Không nhận được dữ liệu từ form.',
				EC: -1
			});
		}

		const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

		const result = await specialtyService.createSpecialty(req.body, imagePath);

		if (result.EC === 0) {
			return res.redirect('/admin/chuyen-mon/danh-sach');
		} else {
			return res.status(400).render('layouts/layout', {
				page: 'pages/addSpecialtyPage.ejs',
				pageTitle: 'Thêm chuyên môn',
				EM: result.EM,
				EC: result.EC
			});
		}
	} catch (error) {
		console.error("Lỗi khi thêm chuyên môn:", error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: "Không thể thêm chuyên môn.",
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderSpecialtyListPage,
	renderAddSpecialtyPage,
	handleAddSpecialty
}