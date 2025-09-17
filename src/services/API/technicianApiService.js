import db from '../../models';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize'
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
const getTechnicianSchedulesForStoreManagerApiService = async (storeManagerId) => {
    try {
        const schedules = await db.WorkSchedule.findAll({
            attributes: ['work_schedule_id', 'work_date', 'current_number', 'max_number', 'shift'],
            include: [
                {
                    model: db.Technician,
                    attributes: ['technician_id'],
                    include: [
                        {
                            model: db.User,
                            attributes: ['name', 'phone', 'email', 'avatar']
                        },
                        {
                            model: db.Store,
                            attributes: ['store_id', 'store_manager_id'],
                            where: { store_manager_id: storeManagerId }
                        }
                    ]
                }
            ],
            raw: true, nest: true
        });

        if (!schedules || schedules.length === 0) {
            return {
                EM: "Không tìm thấy lịch làm việc của kỹ thuật viên",
                EC: -1,
                DT: []
            };
        }

        return {
            EM: "Lấy lịch làm việc của kỹ thuật viên thành công",
            EC: 0,
            DT: schedules
        };
    } catch (error) {
        console.error("Lỗi trong getTechnicianSchedulesForStoreManager:", error.message);
        return {
            EM: error.message || "Lỗi server",
            EC: -1,
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllTechniciansForStoreManagerApiService = async (storeManagerId) => {
    try {   
         const technicians = await db.Technician.findAll({
            attributes: ['technician_id', 'avg_rating', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: db.User,
                    attributes: ['name', 'phone', 'email', 'avatar']
                },
                {
                    model: db.Store,
                    attributes: ['store_id', 'store_manager_id'],
                    where: { store_manager_id: storeManagerId }
                },
                {
                    model: db.Specialty,
                    attributes: ['specialty_id', 'name'],
                    through: { attributes: [] }
                }
            ],
        });

        if (!technicians || technicians.length === 0) {
            return {
                EM: "Không tìm thấy kỹ thuật viên thuộc cửa hàng trưởng này",
                EC: -1,
                DT: []
            };
        }

        const techniciansWithBookingCount = await Promise.all(
            technicians.map(async (technician) => {
                const bookingCount = await db.RepairBooking.count({
                    // where: { status: 'completed' },
                    include: [
                        {
                            model: db.WorkSchedule,
                            where: { technician_id: technician.technician_id }
                        }
                    ]
                });

                return {
                    ...technician.toJSON(),
                    bookingCount
                };
            })
        );

        
        return {
            EM: "Lấy danh sách kỹ thuật viên thành công",
            EC: 0,
            DT: techniciansWithBookingCount
        };
    } catch (error) {
        console.error("Lỗi trong getAllTechniciansForStoreManager:", error.message);
        return {
            EM: error.message || "Lỗi server",
            EC: -1,
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAvailableTechniciansForStoreManagerApiService = async (storeManagerId) => {
    try {   
        const technicians = await db.Technician.findAll({
            attributes: ['technician_id'],
            include: [
                {
                    model: db.User,
                    attributes: ['name', 'phone', 'email', 'avatar']
                },
                { 
                    model: db.WorkSchedule,
                    attributes: ['work_schedule_id', 'work_date', 'current_number', 'max_number'],
                },
                {
                    model: db.Store,
                    attributes: ['store_id', 'store_manager_id'],
                    where: { store_manager_id: storeManagerId }
                }
            ],
            raw: true,
            nest: true
        });

        if (!technicians || technicians.length === 0) {
            return {
                EM: "Không tìm thấy kỹ thuật viên thuộc cửa hàng trưởng này",
                EC: -1,
                DT: []
            };
        }

        return {
            EM: "Lấy danh sách kỹ thuật viên thành công",
            EC: 0,
            DT: technicians
        };
    } catch (error) {
        console.error("Lỗi trong getAllTechniciansForStoreManager:", error.message);
        return {
            EM: error.message || "Lỗi server",
            EC: -1,
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createTechnicianForStoreManagerApiService = async ({ storeManagerId, storeId, name, email, phone, password, avatar, specialties }) => {
	const transaction = await db.sequelize.transaction();
	try {
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Tạo User
		const newUser = await db.User.create({ 
            name,
            email,
            phone,
            password: hashedPassword,
            avatar: avatar ? `/uploads/${avatar}` : null,
            role: 2
        }, { transaction });


		// Tạo Technician
		const newTechnician = await db.Technician.create({
			user_id: newUser.user_id,
			store_id: storeId,
			avg_rating: 0
		}, { transaction });

		// Gán specialties nếu có
		const specArray = Array.isArray(specialties) ? specialties : (specialties ? [specialties] : []);
		if (specArray.length > 0) {
			const foundSpecialties = await db.Specialty.findAll({ 
				where: { specialty_id: specArray },
				transaction
			});
			await newTechnician.addSpecialties(foundSpecialties, { transaction });
		}

		// Commit
		await transaction.commit();

		return {
			EM: "Tạo kỹ thuật viên thành công",
			EC: 0,
			DT: { user_id: newUser.user_id, technician_id: newTechnician.technician_id }
		};
	} catch (error) {
		await transaction.rollback();
		console.error("Lỗi trong createTechnicianForStoreManagerApiService:", error.message);
		return { EM: "Không thể tạo kỹ thuật viên", EC: -1, DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateTechnicianForStoreManagerApiService = async ({ storeManagerId, technicianId, name, email, phone, avatar, specialties }) => {
	const transaction = await db.sequelize.transaction();
	try {
		const technician = await db.Technician.findOne({
			where: { technician_id: technicianId },
			include: [{ model: db.User }],
			transaction
		});

		if (!technician) {
			await transaction.rollback();
			return { EM: "Không tìm thấy kỹ thuật viên", EC: -1, DT: {} };
		}

		await technician.User.update(
			{ name, email, phone, avatar },
			{ transaction }
		);

		if (Array.isArray(specialties)) {
			const foundSpecialties = await db.Specialty.findAll({
				where: { specialty_id: specialties },
				transaction
			});
			await technician.setSpecialties(foundSpecialties, { transaction });
		}

		await transaction.commit();

		return {
			EM: `Cập nhật kỹ thuật viên #${technician.technician_id} thành công`,
			EC: 0,
			DT: { technician_id: technician.technician_id, user_id: technician.user_id }
		};
	} catch (error) {
		await transaction.rollback();
		console.error("updateTechnicianForStoreManagerApiService error:", error.message);
		return { EM: error.message || "Lỗi server", EC: -1, DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getAllTechnicians,
    getTechnicianById,
    getSimilarTechniciansApiSerrvice,
    getTechnicianSchedulesForStoreManagerApiService,
    getAllTechniciansForStoreManagerApiService,
    getAvailableTechniciansForStoreManagerApiService,
    
    createTechnicianForStoreManagerApiService,
    updateTechnicianForStoreManagerApiService,
}