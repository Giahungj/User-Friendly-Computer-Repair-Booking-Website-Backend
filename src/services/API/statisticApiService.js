import { where } from 'sequelize/lib/sequelize';
import db from '../../models';
import { Op, fn, col, literal } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const bookingsSummary = async (storeManagerId, startDate, endDate, technicianId = "") => { 
	try {
		const whereClause = {};

		if (startDate && endDate) {
			whereClause.createdAt = { [Op.between]: [startDate, endDate] };
		}

		const data = await db.RepairBooking.findAll({
			include: [
				{
					model: db.WorkSchedule,
					where: technicianId ? { technician_id: technicianId } : {},
					attributes: [],
					include: [
						{
							model: db.Technician,
							include: [
								{
									model: db.Store,
									attributes: [],
									where: { store_manager_id: storeManagerId },
								},
							],
						},
					],
				},
			],
			where: whereClause,
			attributes: [
				["status", "status"],
				[fn("COUNT", col("RepairBooking.booking_id")), "count"],
			],
			group: ["status"],
		});

		return { EC: 0, EM: "Lấy dữ liệu thành công", DT: data };
	} catch (err) {
		console.error("getAppointmentsStatusSummary error:", err);
		return { EC: -1, EM: "Lỗi truy vấn", DT: [] };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const totalBookings = async (storeManagerId, startDate, endDate, technicianId) => { 
	try {
		const whereClause = startDate && endDate 
			? { createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] } } 
			: {};

		const [result] = await db.RepairBooking.findAll({
			include: [{
				model: db.WorkSchedule,
				where: technicianId ? { technician_id: technicianId } : {},
				attributes: [],
				include: [{
					model: db.Technician,
					attributes: [],
					include: [{
						model: db.Store,
						attributes: [],
						where: { store_manager_id: storeManagerId },
					}],
				}],
			}],
			where: whereClause,
			attributes: [[fn("COUNT", col("RepairBooking.booking_id")), "total"]],
			raw: true,
		});

		return { EC: 0, EM: "Lấy dữ liệu thành công", DT: result };
	} catch (err) {
		console.error("bookingsSummary error:", err);
		return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const bookingsList = async (storeManagerId, startDate, endDate, technicianId = "") => { 
	try {
		const whereClause = {};
		if (startDate && endDate) {
			whereClause.createdAt = {
				[Op.between]: [new Date(startDate), new Date(endDate)],
			};
		}

		const data = await db.RepairBooking.findAll({
			where: whereClause,
			include: [
				{
					model: db.WorkSchedule,
					where: technicianId ? { technician_id: technicianId } : {},
					attributes: [],
					include: [
						{
							model: db.Technician,
							attributes: [],
							include: [
								{
									model: db.Store,
									attributes: [],
									where: { store_manager_id: storeManagerId },
								},
							],
						},
					],
				},
				{
					model: db.Customer,
					include: [{ model: db.User }]
				}
			],
		});

		return { EC: 0, EM: "Lấy danh sách booking thành công", DT: data };
	} catch (err) {
		console.error("bookingsSummary error:", err);
		return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const pieChart = async (storeManagerId, startDate, endDate, technicianId = "") => { 
	try {
		const whereClause = {};
		if (startDate && endDate) {
			whereClause.createdAt = {
				[Op.between]: [new Date(startDate), new Date(endDate)],
			};
		}

		const data = await db.RepairBooking.findAll({
			where: whereClause,
			include: [
				{
					model: db.WorkSchedule,
					where: technicianId ? { technician_id: technicianId } : {},
					attributes: [],
					include: [
						{
							model: db.Technician,
							attributes: [],
							include: [
								{
									model: db.Store,
									attributes: [],
									where: { store_manager_id: storeManagerId },
								},
							],
						},
					],
				},
				{
					model: db.Customer,
					include: [{ model: db.User }]
				}
			],
		});

		return { EC: 0, EM: "Lấy danh sách booking thành công", DT: data };
	} catch (err) {
		console.error("bookingsSummary error:", err);
		return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const lineChart = async (storeManagerId, startDate, endDate, periodType, technicianId = "") => {
	try {
		const whereClause = {};
		if (startDate && endDate) {
			whereClause.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
		}

		const data = await db.RepairBooking.findAll({
			where: whereClause,
			include: [
				{
					model: db.WorkSchedule,
					where: technicianId ? { technician_id: technicianId } : {},
					attributes: [],
					include: [
						{
							model: db.Technician,
							attributes: [],
							include: [
								{
									model: db.Store,
									attributes: [],
									where: { store_manager_id: storeManagerId },
								},
							],
						},
					],
				},
			],
			attributes: [
				[
					fn(
						"DATE_FORMAT",
						col("RepairBooking.createdAt"),
						periodType === "month" ? "%Y-%m" : periodType === "year" ? "%Y" : "%Y-%m-%d"
					),
					"period",
				],
				["status", "status"],
				[fn("COUNT", col("RepairBooking.booking_id")), "count"],
			],
			group: ["period", "status"],
			order: [[literal("period"), "ASC"]],
			raw: true,
		});

		const result = {};
		data.forEach(({ period, status, count }) => {
			if (!result[period]) {
				result[period] = { period, completed: 0, cancelled: 0, pending: 0 };
			}
			result[period][status] = count;
		});

		return { EC: 0, EM: "Lấy dữ liệu thành công", DT: Object.values(result) };
	} catch (err) {
		console.error("lineChart error:", err);
		return { EC: -1, EM: "Lỗi truy vấn", DT: [] };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	bookingsSummary,
	totalBookings,
	bookingsList,
	pieChart,
	lineChart,
};