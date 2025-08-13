import bookingApiService from '../../services/bookingApiService';
import { formatDate } from '../../utils/formatUtil';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getDataForCreateBookingApiService = async (workScheduleId, userId) => {
    try {
        const workSchedule = await db.WorkSchedule.findOne({
            where: { work_schedule_id: workScheduleId },
            raw: true, nest: true
        });

        const customer = await db.Customer.findOne({
            attributes: ['customer_id'],
            include: [{
                where: { user_id: userId },
                model: db.User,
                attributes: ['user_id', 'name', 'email', 'phone']
            }],
            raw: true, nest: true
        });
        return {
            EM: "Đã lấy lịch thành công!",
            EC: 0,
            DT: {workSchedule, customer}
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getDataForCreateBookingApiService
}