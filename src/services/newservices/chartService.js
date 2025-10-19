import e from 'connect-flash';
import db from '../../models/index.js';
import { Op, fn, col, literal } from "sequelize";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getDailyStatistics = async (fromDate, toDate) => {
	try {
		const result = await db.RepairBooking.findAll({
			attributes: [
				[fn("DATE", col("booking_date")), "date"],
				[fn("COUNT", col("*")), "totalBookings"],
				[fn("SUM", literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), "completed"],
				[fn("SUM", literal("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END")), "cancelled"],
				[fn("SUM", literal("CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END")), "inProgress"],
				[fn("SUM", literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), "pending"]
			],
			where: {
				booking_date: { [Op.between]: [fromDate, toDate] }
			},
			group: [fn("DATE", col("booking_date"))],
			order: [[fn("DATE", col("booking_date")), "ASC"]],
			raw: true
		});


		return result.map(r => ({
			date: r.date,
			totalBookings: +r.totalBookings,
			completed: +r.completed,
			cancelled: +r.cancelled,
			inProgress: +r.inProgress,
			pending: +r.pending,
		}));
	} catch (error) {
		console.error(error);
		throw error;
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getStoreStatistics = async ({ date, storeId }) => {
	try {
		// Lấy danh sách kỹ thuật viên thuộc cửa hàng
		const technicians = await db.Technician.findAll({
			where: { store_id: storeId },
			include: [{ model: db.User, attributes: ['name'] }],
			attributes: ['technician_id'],
			raw: true
		});

		const results = [];

		for (const tech of technicians) {
			const data = await db.RepairBooking.findOne({
				attributes: [
					[fn("SUM", literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), "completed"],
					[fn("SUM", literal("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END")), "cancelled"],
				],
				include: [{
					model: db.WorkSchedule,
					attributes: [],
					where: { technician_id: tech.technician_id }
				}],
				where: { booking_date: { [Op.eq]: date } },
				raw: true
			});

			results.push({
				technicianName: tech["User.name"],
				completed: +(data?.completed || 0),
				cancelled: +(data?.cancelled || 0)
			});
		}

		return results;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default { getDailyStatistics, getStoreStatistics };
