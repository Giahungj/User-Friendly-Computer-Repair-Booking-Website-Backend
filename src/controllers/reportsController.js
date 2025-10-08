import reportService from '../services/newservices/reportService.js';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getPerformanceReport = async (req, res) => {
	try {
		const { type, fromDate, toDate } = req.query; 
		const data =
			type === 'store'
				? await reportService.calcPerformanceByStore(fromDate, toDate)
				: await reportService.calcPerformanceByTechnician(fromDate, toDate);

        return res.render('layouts/layout', {
            page: 'pages/reports/performance',
            pageTitle: 'Báo cáo Hiệu suất Xử lý',
            data,
			type,
			fromDate,
			toDate,
		});
	} catch (error) {
		console.error('Lỗi khi lấy báo cáo hiệu suất:', error);
		res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu.');
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getPerformanceReport,
};
