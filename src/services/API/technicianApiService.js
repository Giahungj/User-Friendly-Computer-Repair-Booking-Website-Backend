import db from '../../models';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Lấy kỹ thuật viên cơ bản
async function getTechniciansBase() {
	return await db.Technician.findAll({
		attributes: ['technician_id', 'user_id', 'store_id', 'avg_rating'],
		include: [
			{ model: db.User, attributes: ['name', 'phone', 'email', 'avatar'], order: [['createdAt', 'DESC']] },
			{ model: db.Store, attributes: ['store_id', 'name', 'address'] },
		],
		raw: true,
		nest: true
	});
}

// Lấy chuyên môn của kỹ thuật viên
async function getTechnicianSpecialties(technicianId) {
	return await db.Specialty.findAll({
		include: [{
			model: db.Technician,
			where: { technician_id: technicianId },
			through: { attributes: [] }
		}],
		raw: true,
		nest: true
	});
}

// Lấy lịch làm việc hôm nay
async function getTodaySchedules(technicianId) {
	const today = new Date().toISOString().split('T')[0];
	return await db.WorkSchedule.findAll({
		where: { technician_id: technicianId, work_date: today },
		raw: true,
		nest: true
	});
}

// Đếm số lịch khám của kỹ thuật viên
async function countRepairBookings(technicianId) {
	return await db.RepairBooking.count({
        include: [{
            model: db.WorkSchedule,
            where: { technician_id: technicianId }
        }],
	});
}

// Hàm chính lấy danh sách + sắp xếp ưu tiên
const getAllTechnicians = async () => {
	const technicians = await getTechniciansBase();
	if (!technicians || technicians.length === 0) {
		return { EC: -1, EM: 'Không tìm thấy kỹ thuật viên.', DT: [] };
	}

	const result = await Promise.all(technicians.map(async tech => {
		const [specialties, workSchedules, totalRepairBookings] = await Promise.all([
			getTechnicianSpecialties(tech.technician_id),
			getTodaySchedules(tech.technician_id),
			countRepairBookings(tech.technician_id)
		]);

		const hasEmptySlotToday = workSchedules.some(sch => sch.current_number < sch.max_number);

		return {
			...tech,
			Specialties: specialties,
			TodaySchedules: workSchedules,
			totalRepairBookings: totalRepairBookings,
			HasEmptySlotToday: hasEmptySlotToday
		};
	}));

	// Sắp xếp ưu tiên
	result.sort((a, b) => {
		if (a.HasEmptySlotToday !== b.HasEmptySlotToday) return b.HasEmptySlotToday - a.HasEmptySlotToday;
		if (a.avg_rating !== b.avg_rating) return b.avg_rating - a.avg_rating;
		return b.TotalAppointments - a.TotalAppointments;
	});

	return {
		EM: 'Lấy danh sách kỹ thuật viên thành công',
		EC: 0,
		DT: { technicians: result },
	};
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianById = async (technicianId) => {
    try {
        const technician = await db.Technician.findOne({
            attributes: ['technician_id', 'avg_rating' ],
            where: { technician_id: technicianId },
            include: [
                { model: db.User, attributes: ['name', 'phone', 'email', 'avatar', 'last_active'] },
                { model: db.Store, attributes: ['store_id', 'name', 'address'] }
            ],
            raw: true, nest: true
        });
        if (!technician) {
            return { EC: -1, EM: 'Không tìm thấy kỹ thuật viên.', DT: {} };
        }
        const specialties = await db.Specialty.findAll({
            attributes: ['specialty_id', 'name'],
            include: [{
                attributes: ['technician_id'],
                model: db.Technician,
                where: { technician_id: technicianId },
                through: { attributes: [] }
            }],
            raw: true, nest: true
        });
        
        const bookingCount = await db.Technician.count({
            where: { technician_id: technicianId },
            include: [{
                model: db.WorkSchedule,
                include: [{
                    model: db.RepairBooking,
                }]
            }],
        });

        return {
            EM: 'Lấy chi tiết kỹ thuật viên thành công',
            EC: 0,
            DT: { 
                technician,
                Specialties: specialties,
                totalBookings: bookingCount,
            }
        };
    } catch (error) {
        console.error(`Error in getTechnicianById (id ${technicianId}):`, error.message);
        return {
            EM: error.message || 'Lỗi server',
            EC: -1,
            DT: {}
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getSimilarTechniciansApiSerrvice = async (technicianId) => {
    try {
        const specialties = await db.Specialty.findAll({
            attributes: ['specialty_id'],
            include: [
                {
                    model: db.Technician,
                    where: { technician_id: technicianId },
                    attributes: ['technician_id'],
                    through: { attributes: [] },
                },
            ],
            raw: true, nest: true,
        });

        const specialtyIds = [ ...new Set(specialties.map(spec => spec.specialty_id))];

        const techniciansWithMatch = await db.Technician.findAll({
            attributes: ['technician_id'],
            include: [
                {
                    model: db.Specialty,
                    where: { specialty_id: specialtyIds },
                    attributes: [],
                    through: { attributes: [] }
                }
            ],
            raw: true
        });
        
        const matchedTechnicianIds = techniciansWithMatch.map(t => t.technician_id);

        const technicians = await db.Technician.findAll({
            where: { technician_id: matchedTechnicianIds },
            attributes: ['technician_id', 'avg_rating'],
            include: [
                {
                    model: db.Specialty,
                    attributes: ['specialty_id', 'name'],
                    through: { attributes: [] }
                },
                { model: db.User, attributes: ['user_id', 'name', 'avatar'] },
                { model: db.Store, attributes: ['store_id', 'name', 'address'] }
            ]
        });
        const similarTechnicians = technicians
        .filter(t => t.technician_id !== technicianId)
        .map(t => ({
            ...t.toJSON(),
            Specialties: t.Specialties.map(sp => ({
                ...sp.toJSON(),
                same: specialtyIds.includes(sp.specialty_id)
            }))
        }));

        return {
            EM: 'Lấy kỹ thuật viên tương tự thành công',
            EC: 0,
            DT: similarTechnicians
        };
    } catch (error) {
        console.error(`Error in getTechnicianById (id ${technicianId}):`, error.message);
        return {
            EM: error.message || 'Lỗi server',
            EC: -1,
            DT: {}
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllTechnicians,
    getTechnicianById,
    getSimilarTechniciansApiSerrvice,
}