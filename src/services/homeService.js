// import db from '../models/index.js'
// import formatUtil from '../utils/formatUtil.js'
// // --------------------------------------------------
// const getServiceReport = async () => {
//     try {
//         // Lấy tất cả các dịch vụ
//         const doctorServices = await db.DoctorService.findAll({
//             include: [
//                 { model: db.Service, attributes: ['price', 'id'] }, // Chỉ lấy price và id của dịch vụ
//                 { model: db.Doctors, include: [{ model: db.User, attributes: ['id'] }] } // Chỉ lấy id của bác sĩ
//             ],
//             raw: true
//         });

//         // Phân chia danh sách theo trạng thái
//         const totalServices = doctorServices.length;

//         // Tính tổng doanh thu cho các dịch vụ không phải 'pending'
//         let totalRevenue = doctorServices
//             .filter(item => item.status !== 'pending')
//             .reduce((sum, item) => sum + parseFloat(item["Service.price"] || 0), 0);

//         // Định dạng lại doanh thu
//         totalRevenue = formatUtil.formatCurrency(totalRevenue);

//         // Tính số lượng gói trung bình (serviceId = 2) và gói cao cấp (serviceId = 3)
//         const totalAveragePackages = doctorServices.filter(item => item.serviceId === 2).length;
//         const totalPremiumPackages = doctorServices.filter(item => item.serviceId === 3).length;

//         // Tạo mảng các dịch vụ theo trạng thái
//         let totalPendingServices = 0;
//         let totalActiveAndExpiredServices = 0;

//         // Đếm số lượng dịch vụ theo trạng thái
//         doctorServices.forEach(item => {
//             if (item.status === 'pending') {
//                 totalPendingServices++; // Tăng số lượng dịch vụ 'pending'
//             } else {
//                 totalActiveAndExpiredServices++; // Tăng số lượng dịch vụ 'active' và 'expired'
//             }
//         });

//         // Trả về dữ liệu báo cáo
//         return {
//             EC: 0,
//             EM: 'Lấy báo cáo dịch vụ thành công',
//             DT: { 
//                 totalActiveAndExpiredServices,
//                 totalPendingServices,
//                 totalServices, 
//                 totalRevenue, 
//                 totalAveragePackages, 
//                 totalPremiumPackages 
//             }
//         };
//     } catch (error) {
//         console.error(error);
//         return {
//             EC: -1,
//             EM: 'Lỗi khi lấy báo cáo dịch vụ',
//             DT: []
//         };
//     }
// };

// // --------------------------------------------------
// const getBookingReport = async () => {
//     try {
//         // Lấy tất cả các booking
//         const bookings = await db.Booking.findAll({
//             raw: true
//         });

//         // Tổng số lượng booking
//         const totalBookings = bookings.length;

//         // Tính tổng doanh thu cho các booking không phải 'pending' hoặc 'cancelled'
//         let totalRevenue = bookings
//             .filter(item => item.status !== 'pending' && item.status !== 'cancelled')
//             .reduce((sum, item) => sum + parseFloat(item["Service.price"] || 0), 0);

//         // Định dạng lại doanh thu
//         totalRevenue = formatUtil.formatCurrency(totalRevenue);

//         // Tính số lượng booking chờ (status = 'pending')
//         const totalPendingBookings = bookings.filter(item => item.status === 0).length;

//         // Tính số lượng booking đã xác nhận (status = 'confirmed')
//         const totalConfirmedBookings = bookings.filter(item => item.status === 2).length;

//         // Tính số lượng booking bị hủy (status = 'cancelled')
//         const totalCancelledBookings = bookings.filter(item => item.status === -1).length;

//         // console.log('Total bookings:', totalBookings);
//         // console.log('Total revenue:', totalRevenue);
//         // console.log('Total pending bookings:', totalPendingBookings);
//         // console.log('Total confirmed bookings:', totalConfirmedBookings);
//         // console.log('Total cancelled bookings:', totalCancelledBookings);
//         // Trả về dữ liệu báo cáo
//         return {
//             EC: 0,
//             EM: 'Lấy báo cáo booking thành công',
//             DT: { 
//                 totalBookings,
//                 totalRevenue,
//                 totalPendingBookings,
//                 totalConfirmedBookings,
//                 totalCancelledBookings
//             }
//         };
//     } catch (error) {
//         console.error(error);
//         return {
//             EC: -1,
//             EM: 'Lỗi khi lấy báo cáo booking',
//             DT: []
//         };
//     }
// };

// // --------------------------------------------------
// const getScheduleReport = async () => {
//     try {
//         // Lấy ngày hôm nay, ngày mai, ngày kia
//         const today = new Date();
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);
//         const dayAfterTomorrow = new Date(today);
//         dayAfterTomorrow.setDate(today.getDate() + 2);

//         // Format ngày thành YYYY-MM-DD
//         const dateFilter = [
//             today.toISOString().split('T')[0],
//             tomorrow.toISOString().split('T')[0],
//             dayAfterTomorrow.toISOString().split('T')[0],
//         ];

//         // Lấy schedules trong 3 ngày
//         const schedules = await db.Schedule.findAll({
//             raw: true, nest: true,
//             limit: 30,
//             where: {
//                 date: {
//                     [db.Sequelize.Op.in]: dateFilter,
//                 },
//             },
//             include: [{ model: db.Doctors, include: [{ model: db.User }] }, { model: db.Timeslot }]
//         });

//         // Tổng số schedules
//         const totalSchedules = schedules.length;

//         // Xử lý trạng thái Trống/Đã đầy và tính toán
//         const processedSchedules = schedules
//         .filter(item => item.date !== null && item.date !== undefined) // Lọc bỏ item.date null hoặc undefined
//         .map((item) => {
//             const isFull = item.currentNumber >= item.maxNumber;
//             const shitf = item.Timeslot.shift = 1 ? 'Sáng' : item.Timeslot.shift = 2 ? 'Chiều' : 'Tối';
//             const formatTime = (timeStr) => timeStr?.slice(0, 5);
//             return {
//                 id: item.id,
//                 currentNumber: item.currentNumber,
//                 maxNumber: item.maxNumber,
//                 doctorId: item.Doctor.id,
//                 timeslotId: item.Timeslot.id,
//                 userId: item.Doctor.User.id,
//                 startTime: formatTime(item.Timeslot.startTime),
// 		        endTime: formatTime(item.Timeslot.endTime),
//                 shitf: shitf,
//                 doctorName: item.Doctor.User.name,
//                 date: formatUtil.formatDate(item.date),
//                 availabilityStatus: isFull ? 'Đã đầy' : 'Trống',
//             };
//         });

//         // Nhóm schedules theo date
//         const groupedSchedules = Object.fromEntries(
//             Object.entries(
//                 Object.groupBy(processedSchedules, item => item.date)
//             ).sort(([a], [b]) => {
//                 const [d1, m1, y1] = a.split('/').map(Number);
//                 const [d2, m2, y2] = b.split('/').map(Number);
//                 return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
//             })
//         );

//         // Tính số lượng schedules theo availabilityStatus
//         const totalFullSchedules = processedSchedules.filter(item => item.availabilityStatus === 'Đã đầy').length;
//         const totalEmptySchedules = processedSchedules.filter(item => item.availabilityStatus === 'Trống').length;

//         // Log để kiểm tra
//         console.log('----------------------------------------------------------------------------------------------------');
//         console.log('Total schedules:', totalSchedules);
//         console.log('Total full schedules:', totalFullSchedules);
//         console.log('Total empty schedules:', totalEmptySchedules);
//         console.log('Processed schedules:', groupedSchedules);
//         console.log('----------------------------------------------------------------------------------------------------');

//         // Trả về dữ liệu báo cáo
//         return {
//             EC: 0,
//             EM: 'Lấy báo cáo schedules thành công',
//             DT: {
//                 totalSchedules,
//                 totalFullSchedules,
//                 totalEmptySchedules,
//                 schedules: groupedSchedules,
//             },
//         };
//     } catch (error) {
//         console.error('Lỗi khi lấy báo cáo schedules:', error);
//         return {
//             EC: -1,
//             EM: 'Lỗi khi lấy báo cáo schedules',
//             DT: [],
//         };
//     }
// };

// // --------------------------------------------------
// const getServiceChartData = async () => {
//     try {
//         const sevenDaysAgo = new Date();
//         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
//         // console.log('[Chart] sevenDaysAgo:', sevenDaysAgo.toISOString().slice(0,10));
        
//         // 2. query
//         const rows = await db.DoctorService.findAll({
//             attributes: [
//                 [db.sequelize.fn('DATE', db.sequelize.col('DoctorService.startDate')), 'd'],
//                 [
//                   db.sequelize.literal(
//                     'SUM(CASE WHEN DoctorService.status != "pending" THEN Service.price ELSE 0 END)'
//                   ),
//                   'revenue'
//                 ]
//             ],
//             include: [{ model: db.Service, attributes: [] }],
//             where: {
//                 startDate: { [db.Sequelize.Op.gte]: sevenDaysAgo }
//             },
//             group: ['d'],
//             raw: true
//         });
        
//         // console.log('[Chart] raw rows:', rows);
        
//         const labels = [];
//         const data   = [];
        
//         for (let i = 0; i < 7; i++) {
//             const d = new Date(sevenDaysAgo);
//             d.setDate(sevenDaysAgo.getDate() + i);
//             const key = d.toISOString().slice(0, 10);
//             labels.push(key);
        
//             const row = rows.find(r => r.d === key);
//             data.push(row ? Number(row.revenue) : 0);
        
//             // console.log(`[Chart] ${key} =>`, row ? row.revenue : 0);
//         }
        
//         // console.log('[Chart] labels:', labels);
//         // console.log('[Chart] data:', data);

//         return { EC: 0, DT: { labels, data } };
//     } catch (err) {
//         console.error(err);
//         return { EC: -1, DT: null };
//     }
// };

// // --------------------------------------------------
// const getBookingChartData = async () => {
//     try {
//         const sevenDaysAgo = new Date();
//         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
//         console.log('[Booking Chart] sevenDaysAgo:', sevenDaysAgo.toISOString().slice(0, 10));
        
//         // Query để lấy số lượng đặt lịch mỗi ngày trong 7 ngày gần đây
//         const rows = await db.Booking.findAll({
//             attributes: [
//                 [db.sequelize.fn('DATE', db.sequelize.col('Booking.date')), 'd'],  // Ngày
//                 [db.sequelize.fn('COUNT', db.sequelize.col('Booking.id')), 'count']  // Số lượng booking
//             ],
//             where: {
//                 date: { [db.Sequelize.Op.gte]: sevenDaysAgo }
//             },
//             group: ['d'],
//             raw: true
//         });
        
//         console.log('[Booking Chart] raw rows:', rows);
        
//         const labels = [];
//         const data   = [];
        
//         for (let i = 0; i < 7; i++) {
//             const d = new Date(sevenDaysAgo);
//             d.setDate(sevenDaysAgo.getDate() + i);
//             const key = d.toISOString().slice(0, 10);
//             labels.push(key);
        
//             const row = rows.find(r => r.d === key);
//             data.push(row ? Number(row.count) : 0);
        
//             console.log(`[Booking Chart] ${key} =>`, row ? row.count : 0);
//         }
        
//         console.log('[Booking Chart] labels:', labels);
//         console.log('[Booking Chart] data:', data);

//         return { EC: 0, DT: { labels, data } };
//     } catch (err) {
//         console.error(err);
//         return { EC: -1, DT: null };
//     }
// };

// // --------------------------------------------------
// const getDemoData = async () => {
//     try {
//         const rows = await db.RepairBooking.findAll({
//             raw: true,
//         });
        
//         console.log('[Booking Chart] raw rows:', rows);
        
//         return { EC: 0, EM: 'không có lỗi', DT: rows };
//     } catch (error) {
//         console.error(error);
//         return {
//             EC: -1,
//             EM: 'Lỗi khi lấy dữ liệu mẫu',
//             DT: []
//         };
//     }
// };

// // --------------------------------------------------
// export default { 
//     getServiceReport, 
//     getBookingReport,
//     getScheduleReport,
//     getServiceChartData,
//     getBookingChartData,
//     getDemoData
// };
