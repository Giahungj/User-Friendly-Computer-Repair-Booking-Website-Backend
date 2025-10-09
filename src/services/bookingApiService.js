import { where } from "sequelize/lib/sequelize";
import db from "../models";
import { Op } from "sequelize";
import notificationService from "./newservices/notificationApiService";
import syncData from "../utils/syncData";
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getAllBooking = async () => {
    try {
        let bookings = await db.RepairBooking.findAll({
            raw: true,
            nest: true
        });
        console.log("Booking:", bookings);
        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: bookings,
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getDataForCreateBookingApiService = async (workScheduleId, userId) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            attributes: ['work_schedule_id', 'work_date', 'shift', 'max_number', 'current_number'],
            include: [{
                model: db.Technician,
                attributes: ['technician_id'],
                include: [{ 
                    model: db.Store,
                    attributes: ['store_id', 'name', 'address', 'store_image'],
                }, { 
                    model: db.User,
                    attributes: ['user_id', 'name', 'email', 'phone', 'avatar'],
                }]
            }],
            raw: true, nest: true
        });

        if (!workSchedule) {
            return { EC: 1, EM: "Không tìm thấy lịch làm việc", DT: {} };
        }

        const customer = await db.Customer.findOne({
            attributes: ['customer_id'],
            include: [{
                where: { user_id: userId },
                model: db.User,
                attributes: ['user_id', 'name', 'email', 'phone']
            }],
            raw: true, nest: true
        });

        if (!customer) {
            return { EC: 2, EM: "Không tìm thấy thông tin khách hàng! Người dùng này thuộc quyền truy cập khác.", DT: {} };
        }

        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: { workSchedule, customer }
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readAllBookingsForStoreManagerApiService = async (storeManagerId) => {
    try {
        // Lấy store của storeManager
        const store = await db.Store.findOne({
            where: { store_manager_id: storeManagerId }, // giả sử có cột manager_id
            raw: true
        });

        if (!store) {
            return { EC: 1, EM: "Không tìm thấy cửa hàng cho store manager", DT: [] };
        }

        // Lấy tất cả technician của store
        const technicians = await db.Technician.findAll({
            where: { store_id: store.store_id },
            raw: true
        });

        if (!technicians || technicians.length === 0) {
            return { EC: 2, EM: "Không có kỹ thuật viên nào trong cửa hàng này", DT: [] };
        }

        const technicianIds = technicians.map(t => t.technician_id);

        // Lấy danh sách bookings thông qua WorkSchedule
        const bookings = await db.RepairBooking.findAll({
            include: [
                {
                    model: db.WorkSchedule,
                    where: { technician_id: technicianIds },
                    include: [{
                        model: db.Technician,
                        include: [
                            { model: db.User },
                            { model: db.Store }
                        ]
                    }]
                },
                {
                    model: db.Customer,
                    include: [{ model: db.User }]
                }
            ],
            order: [['createdAt', 'DESC']],
            raw: true, nest: true
        });

        return {
            EC: 0,
            EM: "Lấy danh sách đặt lịch thành công!",
            DT: bookings
        };

    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: [] };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createBookingApiService = async ({ issueDescription, deviceType, model, brand, issueImage, workScheduleId, customerId, bookingDate, bookingTime }) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            attributes: ['current_number', 'max_number']
        });

        if (!workSchedule) {
            return { EC: 2, EM: "Không tìm thấy lịch làm việc", DT: {} };
        }

        if (workSchedule.current_number >= workSchedule.max_number) {
            return { EC: 3, EM: "Lịch đã đầy, không thể đặt thêm", DT: {} };
        }

        const repairBooking = await db.RepairBooking.create({
            issue_description: issueDescription,
            device_type: deviceType,
            model,
            brand,
            issue_image: issueImage,
            work_schedule_id: workScheduleId,
            customer_id: customerId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: 'pending'
        });

        // Sau khi tạo, tăng current_number
        if (repairBooking) {
            await db.WorkSchedule.increment('current_number', {
                by: 1,
                where: { work_schedule_id: workScheduleId }
            });

            console.log("Tạo lịch thành công:", repairBooking.booking_id);
            return { EC: 0, EM: "Tạo lịch thành công", DT: repairBooking.booking_id };
        } else {
            console.error("Không thể tạo lịch");
            return { EC: 1, EM: "Không thể tạo lịch", DT: {} };
        }
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn khi tạo lịch", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const cancelBookingApiService = async ({ bookingId, reason }) => {
    try {
        const booking = await db.RepairBooking.findOne({
            where: { booking_id: bookingId },
            include: [{ model: db.WorkSchedule, attributes: ['work_schedule_id', 'current_number'] }]
        });

        if (!booking) {
            return { EC: 2, EM: "Không tìm thấy lịch hẹn", DT: {} };
        }

        if (booking.status === 'cancelled') {
            return { EC: 3, EM: "Lịch hẹn đã bị hủy trước đó", DT: {} };
        }
        // Cập nhật trạng thái và lý do hủy
        await booking.update({
            status: 'cancelled',
            notes: reason || 'Không có lý do',
        });

        // Giảm current_number trong WorkSchedule
        await db.WorkSchedule.decrement('current_number', {
            by: 1,
            where: {
                work_schedule_id: booking.work_schedule_id,
                current_number: { [Op.gt]: 0 }
            }
        });

        // Thêm bản ghi vào repairhistory
        await db.RepairHistory.create({
            booking_id: bookingId,
            status: 'cancelled',
            notes: reason || 'Không có lý do',
            action_date: new Date(),
        });

        return { EC: 0, EM: "Hủy lịch thành công", DT: bookingId };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn khi hủy lịch", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const updateBookingApiService = async ({ bookingId, issueDescription, issueImage, deviceType, model, brand }) => {
	try {
		const booking = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
		});
		if (!booking) {
			return { EC: 2, EM: "Không tìm thấy lịch hẹn", DT: {} };
		}
		if (booking.status === 'cancelled') {
			return { EC: 3, EM: "Không thể cập nhật đơn đã bị hủy", DT: {} };
		}

		const updatedData = {
			device_type: deviceType || "",
			model: model || "",
			brand: brand || "",
            issue_description: issueDescription || "",
        };

        if (issueImage !== undefined) {
            updatedData.issue_image = issueImage;
        } else {
            updatedData.issue_image = booking.issue_image;
        }
        console.log("📌 Dữ liệu `updatedData` trước khi cập nhật:", updatedData);
		// await booking.update(updatedData);

        // Thêm bản ghi vào repairhistory
        await db.RepairHistory.create({
            booking_id: bookingId,
            status: 'updated',
            notes: 'Cập nhật thông tin',
            action_date: new Date(),
        });
		return { EC: 0, EM: "Cập nhật lịch thành công", DT: booking };
	} catch (error) {
		console.error("Update booking error:", error);
		return { EC: -1, EM: "Lỗi khi cập nhật lịch", DT: {} };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingByIdApiService = async (bookingId) => {
    try {
        const fullBooking = await db.RepairBooking.findOne({
		where: { booking_id: bookingId },
		attributes: [
			'booking_id', 'issue_description', 'device_type', 'model', 'brand',
			'issue_image', 'booking_date', 'booking_time', 'status'
		],
		include: [
			{
				model: db.WorkSchedule,
				attributes: ['work_schedule_id', 'work_date', 'shift', 'max_number', 'current_number'],
				include: [{
					model: db.Technician,
					attributes: ['technician_id'],
					include: [
						{ model: db.Store, attributes: ['store_id', 'name', 'address', 'store_image'] },
						{ model: db.User, attributes: ['user_id', 'name', 'email', 'phone', 'avatar'] }
					]
				}]
			},
			{
				model: db.Customer,
				attributes: ['customer_id'],
				include: [
					{ model: db.User, attributes: ['user_id', 'name', 'email', 'phone'] }
				]
			},
			{
				model: db.RepairHistory,
				attributes: ['history_id', 'notes', 'action_date', 'createdAt', 'status'],
				separate: true,
				order: [['action_date', 'DESC']]
			}
		]
	});

	return fullBooking
		? { EC: 0, EM: "Lấy thông tin lịch hẹn thành công", DT: fullBooking }
		: { EC: 1, EM: "Không tìm thấy lịch hẹn", DT: {} };
    } catch (error) {
        console.error("getBookingByIdApiService error:", error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getCustomerBookingsApiService = async (userId) => {
    try {
        const customer = await db.Customer.findOne({
            where: { user_id: userId },
            raw: true, nest: true
        });
        const whereClause = { customer_id: customer.customer_id };

        const bookings = await db.RepairBooking.findAll({
            where: whereClause,
            attributes: ['booking_id', 'booking_date', 'status'],
            include: [
                {
                    model: db.WorkSchedule,
                    attributes: ['work_schedule_id', 'work_date', 'shift'],
                    include: [
                        {
                            model: db.Technician,
                            attributes: ['technician_id'],
                            include: [
                                { model: db.Store, attributes: ['store_id', 'name', 'address'] },
                                { model: db.User, attributes: ['user_id', 'name', 'email', 'phone', 'avatar'] }
                            ]
                        }
                    ]
                },
            ],
            order: [['createdAt', 'DESC']],
            raw: true, nest: true
        });

        if (!bookings || bookings.length === 0) {
            return { EC: 1, EM: "Không tìm thấy đơn đặt lịch", DT: [] };
        }

        return {
            EM: "Lấy danh sách đơn đặt lịch thành công",
            EC: 0,
            DT: bookings
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: [] };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getRepairBookingDetailForStoreManager = async (repair_booking_id) => {
	try {
		const booking = await db.RepairBooking.findOne({
            where: { booking_id: repair_booking_id },
            include: [
                {
                    model: db.WorkSchedule,
                    include: [
                        {
                            model: db.Technician,
                            include: [
                                { model: db.Store },
                                { model: db.User }
                            ]
                        }
                    ]
                },
                {
                    model: db.Customer,
                    include: [{ model: db.User }]
                },
                {
                    model: db.RepairHistory,
                    separate: true,
                    order: [['action_date', 'DESC']]
                }
            ],
        });


		if (!booking) {
			return { EC: 1, EM: "Không tìm thấy đơn đặt lịch", DT: null };
		}

		return {
			EM: "Lấy chi tiết đơn đặt lịch thành công",
			EC: 0,
			DT: booking
		};
	} catch (error) {
		console.error(error);
		return { EC: -1, EM: "Lỗi truy vấn", DT: null };
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const approveRepairBooking = async (bookingId) => {
	try {
		const booking = await db.RepairBooking.findOne({
			where: { booking_id: bookingId },
		});
		if (!booking) {
			return { EC: 2, EM: "Không tìm thấy lịch hẹn", DT: {} };
		}

		await booking.update({ status: "in-progress" });

		await db.RepairHistory.create({
			booking_id: bookingId,
			status: "in-progress",
			notes: "Duyệt đơn thành công",
			action_date: new Date(),
		});

		return { EC: 0, EM: "Đơn đã được duyệt thành công", DT: booking };
	} catch (error) {
		console.error("Approve booking error:", error);
		return { EC: -1, EM: "Lỗi khi duyệt đơn", DT: {} };
	}
};



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getDataForCreateBookingApiService,
    readAllBookingsForStoreManagerApiService,
    createBookingApiService,
    cancelBookingApiService,
    updateBookingApiService,
    getBookingByIdApiService,
    getCustomerBookingsApiService,
    // --------------------------------------------------
    getAllBooking,
    getRepairBookingDetailForStoreManager,
    approveRepairBooking,
}