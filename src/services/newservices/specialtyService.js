import { where } from 'sequelize/lib/sequelize';
import db from '../../models';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllSpecialties = async (page = 1) => {
	try {
		const offset = (page - 1) * 20;
		const { count, rows } = await db.Specialty.findAndCountAll({
			attributes: ['specialty_id', 'name', 'description', 'image', 'createdAt'],
			order: [['createdAt', 'DESC']],
			limit: 20,
			offset,
			raw: true, nest: true
		});
		return {
			EC: 0,
			EM: 'Lấy danh sách chuyên môn thành công',
			DT: { 
				specialties: rows, 
				total: count, 
				totalPages: Math.ceil(count / 20) 
			}
		};
	} catch (error) {
		console.error('Lỗi getAllSpecialtiess:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách chuyên môn',
			DT: [],
			total: 0
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getSpecialtyById = async (specialtyId) => {
	try {
		const specialty = await db.Specialty.findOne({
			where: { specialty_id: specialtyId },
		});
		return {
			EC: 0,
			EM: 'Lấy chuyên môn thành công',
			DT: specialty
		};
	} catch (error) {
		console.error('Lỗi getAllSpecialtiess:', error);
		return {
			EC: -1,
			EM: 'Lỗi khi lấy danh sách chuyên môn',
			DT: [],
			total: 0
		};
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createSpecialty = async (data, imagePath) => {
	try {
		const { name, description } = data;

		if (!name || !description) {
			return { EC: -1, EM: 'Thiếu tên hoặc mô tả chuyên môn.' };
		}

		const existing = await db.Specialty.findOne({ where: { name } });
		if (existing) {
			return { EC: -1, EM: 'Tên chuyên môn đã tồn tại.' };
		}

		await db.Specialty.create({
			name,
			description,
			image: imagePath
		});

		return { EC: 0, EM: 'Tạo chuyên môn thành công.' };
	} catch (error) {
		console.error('Error creating specialty:', error);
		return { EC: -1, EM: 'Lỗi server khi tạo chuyên môn.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateSpecialty = async (data) => {
	const t = await db.sequelize.transaction();
	try {
		const { specialtyId, name, description, image } = data;

		if (!name || !description) {
			await t.rollback();
			return { EC: -1, EM: 'Thiếu tên hoặc mô tả chuyên môn.' };
		}

		const existing = await db.Specialty.findOne({ 
			where: { name, specialty_id: { [db.Sequelize.Op.ne]: specialtyId } }, 
			transaction: t 
		});
		if (existing) {
			await t.rollback();
			return { EC: -1, EM: 'Tên chuyên môn đã tồn tại.' };
		}

		// Chỉ cập nhật image nếu có dữ liệu mới
		const updateData = { name, description };
		if (image) updateData.image = image;

		await db.Specialty.update(updateData, { 
			where: { specialty_id: specialtyId }, 
			transaction: t 
		});

		await t.commit();
		return { EC: 0, EM: 'Cập nhật chuyên môn thành công.' };
	} catch (error) {
		await t.rollback();
		return { EC: -1, EM: 'Cập nhật chuyên môn thất bại.' };
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	getAllSpecialties,
	createSpecialty,
	updateSpecialty,
	getSpecialtyById,
};
