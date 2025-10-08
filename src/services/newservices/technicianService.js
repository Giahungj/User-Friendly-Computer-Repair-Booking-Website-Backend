import db from "../../models";
import bcrypt from 'bcryptjs';
import { raw } from "body-parser";
import { Op }  from 'sequelize';
import { where } from "sequelize/lib/sequelize";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const searchTechnician = async (page = 1, searchQuery = '') => {
	try {
		const offset = (page - 1) * 10;
		const technicians = await db.Technician.findAndCountAll({
			include: [{ 
				model: db.User, attributes: [ 'name', 'email', 'phone', 'avatar', 'last_active' ],
				where: {
					[Op.or]: [
						{ name: { [Op.like]: `%${searchQuery}%` } },
						{ email: { [Op.like]: `%${searchQuery}%` } },
						{ phone: { [Op.like]: `%${searchQuery}%` } }
					]
				},
			}],
			order: [['createdAt', 'DESC']],
			limit: 10,
			offset,
			raw: true,
			nest: true
		});
		const { count, rows } = technicians;
		return {
			EM: 'Tìm kiếm kỹ thuật viên thành công',
			EC: 0,
			DT: {
				technicians: rows,
				total: count,
				totalPages: Math.ceil(count / 10)
			}
		};
	} catch (error) {
		console.error(error);
		return {
			EM: 'Lỗi server ...',
			EC: -1,
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllTechnician = async (page = 1, searchQuery) => {
	try {
		const offset = (page - 1) * 20;
		const whereClause = {};
		if (searchQuery) {
			whereClause[Op.or] = [
				{ '$User.name$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.email$': { [Op.like]: `%${searchQuery}%` } },
				{ '$User.phone$': { [Op.like]: `%${searchQuery}%` } },
			];
		}
		const technicians = await db.Technician.findAndCountAll({
			attributes: ['technician_id', 'user_id', 'store_id'],
			where: whereClause,
			include: [
				{ model: db.User, attributes: ['name', 'phone', 'email'] },
				{ model: db.Store, attributes: ['name'] }
			],
			order: [['createdAt', 'DESC']],
			limit: 20,
			offset,
			raw: true,
			nest: true
		});

		const { count, rows } = technicians;
		return {
			EM: 'Lấy danh sách kỹ thuật viên thành công',
			EC: 0,
			DT: {
				technicians: rows,
				total: count,
				totalPages: Math.ceil(count / 20)
			}
		};
	} catch (error) {
		console.error(error);
		return {
			EM: "Lỗi server ...",
			EC: -1,
			DT: []
		};
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createTechnician = async (data, avatarPath) => {
	try {
		const { name, email, password, phone, store_id, specialty } = data;
		// Kiểm tra email/phone đã tồn tại
		const existing = await db.User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
		if (existing) return { EC: -1, EM: "Email hoặc số điện thoại đã tồn tại." };
		// Hash password
		const hash = await bcrypt.hash(password, 10);
		// Tạo User
		const user = await db.User.create({ name, email, password: hash, phone, avatar: avatarPath });
		if (!user?.user_id) return { EC: -1, EM: "Tạo tài khoản người dùng thất bại." };
		// Tạo Technician
		const technician = await db.Technician.create({ user_id: user.user_id, store_id });
		// Gán specialties (nếu có)
		if (specialty) {
			const specialties = Array.isArray(specialty) ? specialty : [specialty];
			const specialtyData = specialties.map(id => ({ technician_id: technician.technician_id, specialty_id: id }));
			await db.TechnicianSpecialty.bulkCreate(specialtyData);
		}

		return { EC: 0, EM: "Tạo kỹ thuật viên thành công." };
	} catch (error) {
		console.error("Error creating technician:", error);
		return { EC: -1, EM: "Lỗi server khi tạo kỹ thuật viên." };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getTechnicianById = async (technician_id) => {
	try {
		if (!technician_id) {
			return { EC: -1, EM: 'Thiếu mã kỹ thuật viên.' };
		}

		// Lấy kỹ thuật viên
		let technician = await db.Technician.findOne({
			where: { technician_id },
			include: [
				{ model: db.User, attributes: ['user_id', 'name', 'phone', 'email', 'avatar'] },
				{ model: db.Store },
				{ model: db.WorkSchedule }
			],
		});

		if (!technician) {
			return { EC: -1, EM: 'Không tìm thấy kỹ thuật viên.' };
		}

		// Chuyển instance chính thành JSON
		const result = technician.toJSON();

		// Chuyển WorkSchedules thành array JSON
		if (Array.isArray(result.WorkSchedules)) {
			result.WorkSchedules = result.WorkSchedules.map(ws => ({ ...ws }));
		}

		// Lấy specialties
		const specialties = await db.Specialty.findAll({
			attributes: ['specialty_id', 'name'],
			include: [{
				model: db.Technician,
				where: { technician_id },
				through: { attributes: [] }
			}],
		});

		// Chuyển Specialties thành array JSON
		result.Specialties = specialties.map(s => s.toJSON());

		return {
			EC: 0,
			EM: 'Lấy chi tiết kỹ thuật viên thành công.',
			DT: result
		};
	} catch (error) {
		console.error('Lỗi getTechnicianById:', error);
		return { EC: -1, EM: 'Lỗi server khi lấy chi tiết kỹ thuật viên.' };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    searchTechnician,
	getAllTechnician,
	createTechnician,
	getTechnicianById
}
