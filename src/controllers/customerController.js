import customerService from "../services/newservices/customerService.js";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderCustomerListPage = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const searchQuery = req.query.q || '';
		const result = await customerService.getAllCustomers(page, searchQuery);
		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/customerListPage.ejs',
				pageTitle: 'Danh sách khách hàng',
				customers: result.DT.customers,
				totalCustomers: result.DT.total,
				totalPages: result.DT.totalPages,
				curentPage: page,
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
		console.error('Lỗi khi lấy danh sách khách hàng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải danh sách khách hàng.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderCustomerDetailPage = async (req, res) => {
	try {
		const customer_id = req.params.id;

		const result = await customerService.getCustomerById(customer_id);

		if (result.EC === 0) {
			return res.render('layouts/layout', {
				page: 'pages/customerDetailPage.ejs',
				pageTitle: 'Chi tiết khách hàng',
				customer: result.DT,
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
		console.error('Lỗi khi hiển thị chi tiết khách hàng:', error);
		return res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể hiển thị chi tiết khách hàng.',
			EC: -1
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	renderCustomerListPage,
	renderCustomerDetailPage
};
