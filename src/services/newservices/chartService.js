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
export default { getDailyStatistics };
