import db from '../../models';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllTechnicians = async (pageNum = 1) => {
    try {
        const offset = (pageNum - 1) * 20; 
        const technicians = await db.Technician.findAndCountAll({
            attributes: ['technician_id', 'user_id', 'store_id', 'avg_rating'],
            include: [
				{ model: db.User, attributes: ['name', 'phone', 'email', 'avatar'], order: [['createdAt', 'DESC']] },
				{ model: db.Store, attributes: ['store_id', 'name', 'address'] },
			],
            limit: 20,
            offset,
            raw: true, nest: true
        });
        if (!technicians || technicians.length === 0) {
            return { EC: -1, EM: 'Không tìm thấy kỹ thuật viên.', DT: [] };
        }
        const { count, rows } = technicians;

        // Promise.all để chạy song song
        const result = await Promise.all(rows.map(async tech => {
            const specialties = await db.Specialty.findAll({
                attributes: ['specialty_id', 'name'],
                include: [{
                    model: db.Technician,
                    where: { technician_id: tech.technician_id },
                    through: { attributes: [] }
                }],
                raw: true,
                nest: true
            });

            return {
                ...tech,
                Specialties: specialties
            };
        }));
        return {
            EM: 'Lấy danh sách kỹ thuật viên thành công',
            EC: 0,
            DT: {
                technicians: result,
                total: count,
                totalPages: Math.ceil(count / 20)
            }
        };
    } catch (error) {
        console.error(`Error in getAllTechnicians (page ${pageNum}):`, error.message);
        return {
            EM: error.message || 'Lỗi server',
            EC: -1,
            DT: {
                technicians: [],
                total: 0,
                totalPages: 0
            }
        };
    }
};
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
        const bookingCount = await db.RepairBooking.count({
            include: [{
                model: db.WorkSchedule,
                include: [{
                    model: db.Technician,
                    where: { technician_id: technicianId }
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
    getSimilarTechniciansApiSerrvice
}