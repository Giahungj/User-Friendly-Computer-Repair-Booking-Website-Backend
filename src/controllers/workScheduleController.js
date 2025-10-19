import workScheduleService from '../services/newservices/workScheduleService.js';
import technicianService from '../services/newservices/technicianService.js';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderWorkSchedulePage = async (req, res) => {
	try {
       const { technicianId, date } = req.query;

        const techResult = await technicianService.getAllTechnician();
        const technicians = (techResult?.DT?.technicians || []).map(t => ({
            technician_id: t.technician_id,
            user_id: t.user_id,
            name: t.User?.name || 'Không xác định'
        }));

        let scheduleData = [];
        let technicianName = '';

        // ✅ Gọi lịch làm việc nếu có technicianId
        if (technicianId) {
            const result = await workScheduleService.getScheduleByTechnicianAndDate(technicianId, date);
            if (result.EC === 0) {
                scheduleData = result.DT.schedules;
                technicianName = result.DT.technicianName;
            }
        }

        // ✅ Tạo danh sách sự kiện cho FullCalendar
        const events = scheduleData.map(s => {
            const shiftMap = {
                '1': { label: 'Ca sáng', color: 'bg-teal-300' },
                '2': { label: 'Ca trưa', color: 'bg-yellow-300' },
                '3': { label: 'Ca chiều', color: 'bg-gray-300' }
            };
            const shift = shiftMap[s.shift] || { label: 'Ca khác', color: 'bg-cyan-300' };

            return {
                title: `${shift.label} (${s.current_number}/${s.max_number})`,
                color: shift.color,
                start: `${s.work_date}T08:00`,
                end: `${s.work_date}T17:00`,
                shift: shift.label,
                extendedProps: {
                    technicianId: s.technician_id,
                    workScheduleId: s.work_schedule_id,
                    current: s.current_number,
                    max: s.max_number,
                    storeId: s.storeId,
                    storeName: s.storeName,
                    storeAddress: s.storeAddress,
                    storeImage: s.storeImage
                }
            };
        });

        // ✅ Render ra EJS
        res.render('layouts/layout', {
            page: 'pages/work-schedule/workSchedulePage.ejs',
            pageTitle: 'Lịch làm việc nhân viên',
            technicians,
            selectedTechnician: technicianId || '',
            selectedDate: date || '',
            technicianName: technicianName || 'Bạn chưa chọn kỹ thuật viên',
            events,
            breadcrumbs: [
                { name: 'Trang chủ', url: '/admin/lich-lam-viec/danh-sach' },
                { name: 'Lịch làm việc', active: true },
            ],
        });
	} catch (error) {
		console.error('Lỗi khi render trang lịch làm việc:', error);
		res.status(500).render('layouts/layout', {
			page: 'pages/misc/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải trang lịch làm việc nhân viên.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default { renderWorkSchedulePage };
