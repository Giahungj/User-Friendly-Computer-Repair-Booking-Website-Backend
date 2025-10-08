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

		if (technicianId) {
			const result = await workScheduleService.getScheduleByTechnicianAndDate(technicianId, date);
            console.log('Work schedule fetch result:', result);
			if (result.EC === 0) {
				scheduleData = result.DT.schedules;
				technicianName = result.DT.technicianName;
			}
		}
		// ✅ Dữ liệu mẫu (fallback)
		const sampleData = {
            technicians,
            selectedTechnician: technicianId || '',
            selectedDate: date || '',
            technicianName: technicianName || 'Nguyễn Văn Hoài',
            scheduleData: scheduleData || []
        };

        // ✅ Chuyển scheduleData phẳng → events cho FullCalendar
        const events = sampleData.scheduleData.map(s => {
            let shiftLabel = '';
            let color = '#007bff'; // mặc định

            switch (s.shift) {
                case '1':
                    shiftLabel = 'Ca sáng';
                    color = '#28a745';
                    break;
                case '2':
                    shiftLabel = 'Ca trưa';
                    color = '#ffc107';
                    break;
                case '3':
                    shiftLabel = 'Ca chiều';
                    color = '#6c757d';
                    break;
                default:
                    shiftLabel = 'Ca khác';
            }
            return {
                title: `${shiftLabel} (${s.current_number}/${s.max_number})`,
                start: `${s.work_date}T08:00`,
                end: `${s.work_date}T17:00`,
                backgroundColor: color,
                extendedProps: {
                    technicianId: s.technician_id,
                    workScheduleId: s.work_schedule_id,
                    current: s.current_number,
                    max: s.max_number
                }
            };
        });

		// ✅ Render ra EJS
		res.render('layouts/layout', {
			page: 'pages/workSchedulePage.ejs',
			pageTitle: 'Lịch làm việc nhân viên',
			technicians: sampleData.technicians,
			selectedTechnician: sampleData.selectedTechnician,
			selectedDate: sampleData.selectedDate,
			technicianName: sampleData.technicianName,
			events
		});
	} catch (error) {
		console.error('Lỗi khi render trang lịch làm việc:', error);
		res.status(500).render('layouts/layout', {
			page: 'pages/errorPage.ejs',
			pageTitle: 'Lỗi 500',
			EM: 'Không thể tải trang lịch làm việc nhân viên.',
			EC: -1
		});
	}
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default { renderWorkSchedulePage };
