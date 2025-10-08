import db from '../../models/index.js';
import { Op } from 'sequelize';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const calcPerformanceByTechnician = async (fromDate, toDate) => {
	try {
		const technicians = await db.Technician.findAll({
			attributes: ['technician_id'],
			include: [{
				model: db.WorkSchedule,
				attributes: ['work_schedule_id'],
				include: [{
					model: db.RepairBooking,
					attributes: ['status', 'booking_date']
				}]
			}, {
				model: db.Store,
				attributes: ['name']
			}, {
				model: db.User,
				attributes: ['name']
			}]
		});

		const results = technicians.map(tech => {
			let totalJobs = 0, completedJobs = 0, cancelledJobs = 0;

			tech.WorkSchedules.forEach(w => {
				w.RepairBookings.forEach(r => {
					const bookingDate = new Date(r.booking_date);
					const inRange = (!fromDate || bookingDate >= new Date(fromDate)) &&
									(!toDate || bookingDate <= new Date(toDate));

					if (!inRange) return;

					totalJobs++;
					if (r.status === 'completed') completedJobs++;
					if (r.status === 'cancelled') cancelledJobs++;
				});
			});

			const performanceRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

			return {
				technicianName: tech.User?.name,
				storeName: tech.Store?.name || 'Không xác định',
				totalJobs,
				completedJobs,
				cancelledJobs,
				performanceRate: performanceRate.toFixed(2),
			};
		});

		return results;
	} catch (err) {
		console.error("Lỗi khi lấy báo cáo hiệu suất theo kỹ thuật viên:", err);
		throw err;
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const calcPerformanceByStore = async (fromDate, toDate) => {
	try {
		const stores = await db.Store.findAll({
			attributes: ['store_id', 'name'],
			include: [{
				model: db.Technician,
				attributes: ['technician_id'],
				include: [{
					model: db.WorkSchedule,
					attributes: ['work_schedule_id'],
					include: [{
						model: db.RepairBooking,
						attributes: ['status', 'booking_date']
					}]
				}]
			}]
		});

		const results = stores.map(store => {
			let totalJobs = 0, completedJobs = 0, cancelledJobs = 0;

			store.Technicians.forEach(t => {
				t.WorkSchedules.forEach(w => {
					w.RepairBookings.forEach(r => {
						const bookingDate = new Date(r.booking_date);
						const inRange = (!fromDate || bookingDate >= new Date(fromDate)) &&
										(!toDate || bookingDate <= new Date(toDate));

						if (!inRange) return;

						totalJobs++;
						if (r.status === 'completed') completedJobs++;
						if (r.status === 'cancelled') cancelledJobs++;
					});
				});
			});

			const performanceRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

			return {
				storeName: store.name,
				totalJobs,
				completedJobs,
				cancelledJobs,
				performanceRate: performanceRate.toFixed(2),
			};
		});

		return results;
	} catch (err) {
		console.error("Lỗi khi lấy báo cáo hiệu suất:", err);
		throw err;
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    calcPerformanceByTechnician,
    calcPerformanceByStore,
};