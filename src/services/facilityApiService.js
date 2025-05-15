import db from "../models"
const { Op } = require("sequelize");

// ---------------------------------------------------------
const getFacilityList = async () => {
    try {
        const result = await db.Facility.findAll({ 
            include: [{ model: db.Doctors }],
            order: [['createdAt', 'DESC']],
        });
        
        // Format kết quả
        const facilities = result.map(facility => {
            const facilityJson = facility.toJSON(); // chuyển model instance thành object thường
            facilityJson.totalDoctor = facilityJson.Doctors?.length || 0;
            return facilityJson;
        });
        
        return {
            EM: "Lấy danh sách phòng khám thành công",
            EC: 0,
            DT: facilities
        };
    } catch (error) {
        console.error("Lỗi đọc dữ liệu phòng khám:", error);
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu phòng khám",
            EC: -1,
            DT: []
        };
    }
};

// ---------------------------------------------------------
const switchTheDoctorWorkFacility = async (doctorId, facilityId, oldFacilityId) => {
    try {
        const resuilt = await db.Doctors.update({facilityId: facilityId}, {
            where: { id: doctorId }
        })
        return { EM: "", EC: 0, DT: resuilt }
    } catch (error) {
        console.error("Lỗi đọc dữ liệu chuyên khoa:", error)
        return {
            EM: "Đã có lỗi xảy ra khi đọc dữ liệu chuyên khoa.",
            EC: -1,
            DT: []
        }
    }
}

// ---------------------------------------------------------
const getFacilityById = async (id) => {
	try {
		let facility = await db.Facility.findOne({
			where: { id },
			include: [
				{
					model: db.Doctors,
					include: [{ model: db.User }]
				}
			]
		});

		if (!facility) {
			return {
				EM: "Không tìm thấy cơ sở y tế",
				EC: 1,
				DT: null
			};
		}

		const today = new Date().toISOString().slice(0, 10);

		const doctors = await db.Doctors.findAll({
			where: { facilityId: id },
			include: [
				{ model: db.User },
				{
					model: db.Schedule,
					where: {
						date: {
							[Op.gte]: today
						}
					},
					required: false, // lấy cả bác sĩ không có lịch
					include: [{ model: db.Timeslot }],
				}
			]
		});

		const doctorSchedules = doctors.map((doctor) => {
			const doctorJSON = doctor.toJSON();
			const schedules = doctorJSON.Schedules || [];

			return {
				...doctorJSON,
				hasToday: schedules.some(s => s.date === today),
				scheduleCount: schedules.length,
				firstDate: schedules[0]?.date || null
			};
		});

		// Sắp xếp theo tiêu chí ưu tiên
		doctorSchedules.sort((a, b) => {
			if (a.hasToday !== b.hasToday) return b.hasToday - a.hasToday;
			if (a.scheduleCount !== b.scheduleCount) return b.scheduleCount - a.scheduleCount;
			if (a.firstDate && b.firstDate) return new Date(a.firstDate) - new Date(b.firstDate);
			return 0;
		});

		const facilityData = facility.toJSON();
		facilityData.doctors = doctorSchedules;

		return {
			EM: "Lấy thông tin cơ sở y tế thành công",
			EC: 0,
			DT: facilityData
		};
	} catch (error) {
		console.error("Lỗi đọc dữ liệu cơ sở y tế:", error);
		return {
			EM: "Đã có lỗi xảy ra khi đọc dữ liệu cơ sở y tế",
			EC: -1,
			DT: null
		};
	}
};

// ---------------------------------------------------------
export default { 
    getFacilityList, getFacilityById,
    switchTheDoctorWorkFacility 
}