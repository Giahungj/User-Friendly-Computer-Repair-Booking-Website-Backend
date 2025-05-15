import db from "../models";
import formatUtils from '../utils/formatUtil';
import syncData from "../utils/syncData"

// ---------------------------------------------------------
const getAllFacility = async (page = 1) => {
    try {
        const offset = (page - 1) * 10;
        const facilities = await db.Facility.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: offset,
            raw: true,
            nest: true
        });
        
        if (!facilities || facilities.count === 0) {
            return {
                EC: -1,
                EM: 'Không tìm cơ sở y tế',
                DT: []
            };
        }

        const { count, rows } = facilities;

        return {
            EM: 'Lấy danh sách thuốc thành công',
            EC: 0,
            DT: {
                facilities: rows,
                total: count,
                totalPages: Math.ceil(count / 10)
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

// ---------------------------------------------------------
const getFacilityById = async (facilityId, page = 1) => {
    try {
        const offset = (page - 1) * 5;
        const facility = await db.Facility.findOne({
            where: { id: facilityId }
        })

        if (!facility) {
            return {
                EM: "Không tìm thấy phòng khám.",
                EC: 1,
                DT: null
            }
        }
        
        const doctors = await db.Doctors.findAndCountAll({
            where: { facilityId: facilityId },
            include: [
                { model: db.Specialty },
                { model: db.User },
            ],
            limit: 5,
            offset,
            raw: true,
            nest: true
        })
        
        const { count, rows } = doctors;
        const totalPages = Math.ceil(count / 5);
        if (typeof facility.subImages === 'string') {
            facility.subImages = JSON.parse(facility.subImages || []);
        }
        const facilityData = {
            id: facility.id || "",
            name: facility.name || "",
            phone: facility.phone || "",
            address: facility.address || "",
            description: facility.description || "",
            mainImage: facility.mainImage || "",
            subImages: facility.subImages || [],
            createdAt: formatUtils.formatDate(facility.createdAt),
            updatedAt: formatUtils.formatDate(facility.updatedAt)
        };
        return { 
            EM: "", 
            EC: 0, 
            DT: {
                facilityData, doctors: rows, total: count, totalPages
            }
        }
    } catch (error) {
        console.error("Lỗi đọc chi tiết phòng khám:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc thông tin phòng khám.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const createFacility = async (data, mainImage, subImages) => {
    console.log('============================================================================');
	try {
		console.log('📦 Bắt đầu tạo cơ sở...');
		
		// Lấy các trường dữ liệu từ data
		const { facilityName, facilityPhone, facilityAddress, facilityDescription } = data;
		console.log('📄 Dữ liệu cơ sở:', { facilityName, facilityPhone, facilityAddress, facilityDescription });

		// Kiểm tra dữ liệu đầu vào
		if (!facilityName || !facilityPhone || !facilityAddress) {
			console.warn('⚠️ Thiếu thông tin bắt buộc khi tạo cơ sở');
			return {
				EC: 1,
				EM: 'Thiếu thông tin bắt buộc',
				DT: null
			};
		}

		// Đảm bảo subImages là mảng chuỗi (nếu có)
		const formattedSubImages = subImages.length > 0 ? subImages.map(file => file.filename) : [];
		console.log('🖼️ Danh sách ảnh phụ:', formattedSubImages);

		// Tạo cơ sở y tế mới
		const newFacility = await db.Facility.create({
			name: facilityName,
			phone: facilityPhone,
			address: facilityAddress,
			description: facilityDescription,
			mainImage,
			subImages: JSON.stringify(formattedSubImages)
		});

		console.log('✅ Cơ sở đã tạo:', newFacility?.id || newFacility);

		if (!newFacility) {
			console.error('❌ Không thể tạo cơ sở trong DB');
			return {
				EC: 1,
				EM: 'Tạo cơ sở thất bại',
				DT: null
			};
		}

        await syncData.syncFacilitiesData();

        console.log('============================================================================');
		return {
			EC: 0,
			EM: 'Tạo cơ sở thành công',
			DT: newFacility
		};
	} catch (error) {
        console.error('🔥 Lỗi tạo cơ sở:', error);
		return {
            EC: -1,
			EM: 'Lỗi server khi tạo cơ sở',
			DT: null
		};
	}
};

// ---------------------------------------------------------
export default {
    createFacility,

    getAllFacility,
    getFacilityById,
}