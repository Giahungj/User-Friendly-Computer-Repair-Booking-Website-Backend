import db from "../../models/index";
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------
const checkEmail = async (email) => {
    try {
        const user = await db.User.findOne({
            where: { email: email }
        })
        if (user) {
            return {
                EM: "Email đã tồn tại! Vui lòng sử dụng email khác.",
                EC: 1,
            }
        }
        return {
            EM: "Email hợp lệ",
            EC: 0,
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
        }
    }
}

// ---------------------------------------------------------
const checkPhoneNumber = async (phone) => {
    try {
        const user = await db.User.findOne({
            where: { phone: phone }
        })
        if (!user) {
            return {
                EM: "Số điện thoại không tồn tại! Vui lòng sử dụng số điện thoại khác.",
                EC: 1,
            }
        }
        return {
            EM: "Số điện thoại hợp lệ",
            EC: 0,
        }
    } catch (error) {
        console.log(error)
        return {
            EM: "Lỗi hệ thống...",
            EC: -1,
        }
    }
}

// ---------------------------------------------------------
const checkPassword = (inputPassord, hashPassword) => {
    return bcrypt.compareSync(inputPassord, hashPassword);
}

// ---------------------------------------------------------
const checkTechnicianBelongsToManager = async ( storeManagerId, technicianId ) => {
    try {
        if (!storeManagerId || !technicianId) {
			console.error("❌ Thiếu storeManagerId hoặc technicianId khi gọi checkTechnicianBelongsToManager");
			return false;
		}
        const store = await db.Store.findOne({
            where: { store_manager_id: storeManagerId },
            include: [
                {
                    model: db.Technician,
                    where: { technician_id: technicianId }
                }
            ],
        });
        if (store) {
            console.log("✅ Technician thuộc quyền quản lý:");
            console.log(JSON.stringify(store, null, 2));
        } else {
            console.log("❌ Không tìm thấy kỹ thuật viên thuộc quyền quản lý này.");
        }

        return !!store;
    } catch (error) {
        console.error("Lỗi khi kiểm tra kỹ thuật viên thuộc quyền quản lý:", error);
        return false;
    }
};

// ---------------------------------------------------------
export default {
    checkEmail,
    checkPhoneNumber,
    checkPassword,
    checkTechnicianBelongsToManager
}