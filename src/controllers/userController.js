import userService from "../services/newservices/userService.js";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderUserListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q || '';
		const result = await userService.getAllUsers(page, searchQuery);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/userListPage.ejs',
				pageTitle: 'Danh sách tài khoản',
				users: result.DT.usersWithRole,
				currentPage: page,
				totalPages: result.DT.totalPages,
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
		console.error('Lỗi khi lấy danh sách tài khoản:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách tài khoản.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderUserDetailPage = async (req, res) => {
	try {
		const user_id = req.params.id;

		const result = await userService.getUserById(user_id);

		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/userDetailPage.ejs',
				pageTitle: 'Chi tiết tài khoản',
				user: result.DT,
				EM: result.EM,
				EC: result.EC
			});
		} else {
			return res.status(404).render('layouts/layout', {
				page: 'pages/errorPage.ejs',
				pageTitle: 'Lỗi',
				EM: result.EM,
				EC: result.EC
			});
		}
	} catch (error) {
		console.error('Lỗi khi hiển thị chi tiết tài khoản:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể hiển thị chi tiết tài khoản.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderUserListPage,
	renderUserDetailPage
}