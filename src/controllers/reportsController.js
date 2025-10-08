import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import path from "path";
import reportService from '../services/newservices/reportService.js';
import chartService from "../services/newservices/chartService.js";

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
const exportPerformanceReport = async (req, res) => {
	try {
		const { type, fromDate, toDate, format } = req.query;

		const data =
			type === "store"
				? await reportService.calcPerformanceByStore(fromDate, toDate)
				: await reportService.calcPerformanceByTechnician(fromDate, toDate);

		// ==== XUẤT EXCEL ====
		if (format === "excel") {
			const wb = new ExcelJS.Workbook();
			const ws = wb.addWorksheet("Hiệu suất");

			const columns =
				type === "store"
					? ["Chi nhánh", "Tổng đơn", "Hoàn thành", "Hủy", "Hiệu suất (%)"]
					: ["Kỹ thuật viên", "Chi nhánh", "Tổng đơn", "Hoàn thành", "Hủy", "Hiệu suất (%)"];

			ws.addRow(columns);

			data.forEach((d) => {
				ws.addRow(
					type === "store"
						? [d.storeName, d.totalJobs, d.completedJobs, d.cancelledJobs, d.performanceRate]
						: [d.technicianName, d.storeName, d.totalJobs, d.completedJobs, d.cancelledJobs, d.performanceRate]
				);
			});

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=report_${type}_${Date.now()}.xlsx`
			);

			await wb.xlsx.write(res);
			res.end();
			return;
		}

		// ==== XUẤT PDF (pdfmake) ====
		const fonts = {
			Roboto: {
				normal: path.join(process.cwd(), "fonts/Roboto-Regular.ttf"),
				bold: path.join(process.cwd(), "fonts/Roboto-Bold.ttf"),
				italics: path.join(process.cwd(), "fonts/Roboto-Italic.ttf"),
				bolditalics: path.join(process.cwd(), "fonts/Roboto-BoldItalic.ttf"),
			},
		};

		const printer = new PdfPrinter(fonts);
		const header =
			type === "store"
				? ["Chi nhánh", "Tổng đơn", "Hoàn thành", "Hủy", "Hiệu suất (%)"]
				: ["Kỹ thuật viên", "Chi nhánh", "Tổng đơn", "Hoàn thành", "Hủy", "Hiệu suất (%)"];

		const body = [
			header,
			...data.map((d) =>
				type === "store"
					? [d.storeName, d.totalJobs, d.completedJobs, d.cancelledJobs, d.performanceRate]
					: [d.technicianName, d.storeName, d.totalJobs, d.completedJobs, d.cancelledJobs, d.performanceRate]
			),
		];

		const docDefinition = {
			content: [
				{
					text: `BÁO CÁO HIỆU SUẤT ${type === "store" ? "THEO CHI NHÁNH" : "THEO KỸ THUẬT VIÊN"}`,
					style: "header",
				},
				{ text: `Từ ${fromDate} đến ${toDate}`, style: "subheader", margin: [0, 0, 0, 10] },
				{
					table: { headerRows: 1, widths: Array(header.length).fill("*"), body },
					layout: "lightHorizontalLines",
				},
			],
			styles: {
				header: { fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
				subheader: { fontSize: 12, alignment: "center" },
			},
			defaultStyle: { font: "Roboto" },
		};

		const pdfDoc = printer.createPdfKitDocument(docDefinition);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=report_${type}_${Date.now()}.pdf`
		);
		pdfDoc.pipe(res);
		pdfDoc.end();
	} catch (error) {
		console.error(error);
		res.status(500).send("Lỗi xuất báo cáo");
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getOverviewReport = async (req, res) => {
	try {
		const { fromDate, toDate } = req.query;
		const overviewReport = await reportService.getOverviewStatistics(fromDate, toDate);
		const dailyStats = await chartService.getDailyStatistics(fromDate, toDate);
        return res.render('layouts/layout', {
            page: 'pages/reports/overview',
            pageTitle: 'Báo cáo tổng quan',
            dailyStats,
			overviewReport,
			fromDate,
			toDate,
		});
	} catch (error) {
		console.error(error);
		return res.json({ EC: -1, EM: "Lỗi khi lấy dữ liệu tổng hợp" });
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getPerformanceReport,
    exportPerformanceReport,
    getOverviewReport, 
};
