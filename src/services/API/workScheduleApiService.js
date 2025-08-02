import db from '../../models';
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getWorkScheduleByTechnician = async (technicianId) => {
    try {
        console.log('Đang gọi đến ApiService!')
        const schedules = await db.WorkSchedule.findAll({
            attributes: ['work_schedule_id', 'work_date', 'max_number', 'current_number', 'shift'],
            where: { technician_id: technicianId },
            order: [['work_date', 'DESC']], // mới nhất trước
            raw: true, nest: true
        });
        if (!schedules || schedules.length === 0) {
            return { EC: 0, EM: 'Không tìm thấy lịch làm việc', DT: [] };
        }
        // nhóm theo ngày
        const grouped = schedules.reduce((acc, item) => {
            if (!acc[item.work_date]) acc[item.work_date] = [];
            acc[item.work_date].push(item);
            return acc;
        }, {});
        // chuyển thành mảng [{work_date, items: [...] }]
        const result = Object.entries(grouped).map(([date, items]) => ({
            work_date: date,
            items
        }));
        return {
            EC: 0,
            EM: 'Lấy lịch làm việc thành công',
            DT: result
        };
    } catch (error) {
        console.error(`Error in getWorkScheduleByTechnician (id ${technicianId}):`, error.message);
        return {
            EC: -1,
            EM: error.message || 'Lỗi server',
            DT: []
        };
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getWorkScheduleByTechnician,
}