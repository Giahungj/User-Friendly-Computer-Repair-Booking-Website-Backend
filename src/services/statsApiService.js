import db from "../models";

// --------------------------------------------------
const getDoctorBookingStats = async (doctorId) => {
    try {
        const doctor = await db.Doctors.findOne({ where: { id: doctorId } });
        if (!doctor) return { EC: 1, EM: "Không tìm thấy bác sĩ", DT: {} };

        const now = new Date();
        const timeRanges = {
            week: new Date(now - 5 * 7 * 24 * 60 * 60 * 1000), // Lấy 5 tuần gần nhất
            month: new Date(now - 6 * 30 * 24 * 60 * 60 * 1000), // 6 tháng gần nhất
            quarter: new Date(now - 4 * 90 * 24 * 60 * 60 * 1000), // 4 quý gần nhất
            year: new Date(now - 3 * 365 * 24 * 60 * 60 * 1000), // 3 năm gần nhất
        };

        const bookings = await db.Booking.findAll({
            where: { createdAt: { [db.Sequelize.Op.gte]: timeRanges.year } },
            include: [{ model: db.Schedule, include: [{ model: db.Doctors, where: { id: doctor.id } }] }],
        });

        const groupedData = { week: {}, month: {}, quarter: {}, year: {} };
        let totalWeek = 0, totalMonth = 0, totalQuarter = 0, totalYear = 0;

        bookings.forEach(booking => {
            const date = new Date(booking.createdAt);
        
            const weekKey = `Tuần ${getWeekNumber(date)}`;
            const monthKey = getMonthKey(date);
            const quarterKey = getQuarterKey(date);
            const yearKey = getYearKey(date);
        
            if (date >= timeRanges.week) {
                groupedData.week[weekKey] = (groupedData.week[weekKey] || 0) + 1;
                totalWeek++;
            }
            if (date >= timeRanges.month) {
                groupedData.month[monthKey] = (groupedData.month[monthKey] || 0) + 1;
                totalMonth++;
            }
            if (date >= timeRanges.quarter) {
                groupedData.quarter[quarterKey] = (groupedData.quarter[quarterKey] || 0) + 1;
                totalQuarter++;
            }
            if (date >= timeRanges.year) {
                groupedData.year[yearKey] = (groupedData.year[yearKey] || 0) + 1;
                totalYear++;
            }
        });

        return {
            EC: 0,
            EM: "Lấy lịch sử các cuộc hẹn thành công!",
            DT: {
                week: { total: totalWeek, data: groupedData.week },
                month: { total: totalMonth, data: groupedData.month },
                quarter: { total: totalQuarter, data: groupedData.quarter },
                year: { total: totalYear, data: groupedData.year },
            },
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};

// --------------------------------------------------
const getDoctorPatientStats = async (doctorId) => {
    try {
        const doctor = await db.Doctors.findOne({ where: { id: doctorId } });
        if (!doctor) return { EC: 1, EM: "Không tìm thấy bác sĩ", DT: null };

        const patients = await db.Patient.findAll({
            include: [
                {
                    model: db.Booking,
                    include: [
                        {
                            model: db.Schedule,
                            include: [{ model: db.Doctors, where: { id: doctor.id } }],
                        },
                    ],
                },
            ],
        });

        const result = {
            week: { total: 0, data: {} },
            month: { total: 0, data: {} },
            quarter: { total: 0, data: {} },
            year: { total: 0, data: {} },
        };

        patients.forEach(patient => {
            patient.Bookings.forEach(booking => {
                const date = new Date(booking.createdAt);
        
                const weekKey = `Tuần ${getWeekNumber(date)}`;
                const monthKey = getMonthKey(date);
                const quarterKey = getQuarterKey(date);
                const yearKey = getYearKey(date);
        
                result.week.total++;
                result.week.data[weekKey] = (result.week.data[weekKey] || 0) + 1;
        
                result.month.total++;
                result.month.data[monthKey] = (result.month.data[monthKey] || 0) + 1;
        
                result.quarter.total++;
                result.quarter.data[quarterKey] = (result.quarter.data[quarterKey] || 0) + 1;
        
                result.year.total++;
                result.year.data[yearKey] = (result.year.data[yearKey] || 0) + 1;
            });
        });

        return { EC: 0, EM: "Lấy thống kê bệnh nhân thành công!", DT: result };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: null };
    }
};

// --------------------------------------------------
const getDoctorRevenueStats = async (doctorId) => {
    try {
        const payments = await db.DoctorPayments.findAll({
            where: { doctorId },
        });

        if (!payments.length) return { EC: 1, EM: "Không có dữ liệu doanh thu", DT: {} };

        const result = {
            week: { total: 0, data: [] },
            month: { total: 0, data: [] },
            quarter: { total: 0, data: [] },
            year: { total: 0, data: [] },
        };

        const weekMap = new Map();
        const monthMap = new Map();
        const quarterMap = new Map();
        const yearMap = new Map();

        payments.forEach(payment => {
            const date = new Date(payment.paymentDate);
            const amount = payment.paymentAmount || 0;
        
            // Thống kê theo tuần
            const weekKey = `Tuần ${getWeekNumber(date)}`;
            result.week.total += amount;
            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + amount);
        
            // Thống kê theo tháng
            const monthKey = getMonthKey(date);
            result.month.total += amount;
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amount);
        
            // Thống kê theo quý
            const quarterKey = getQuarterKey(date);
            result.quarter.total += amount;
            quarterMap.set(quarterKey, (quarterMap.get(quarterKey) || 0) + amount);
        
            // Thống kê theo năm
            const yearKey = getYearKey(date);
            result.year.total += amount;
            yearMap.set(yearKey, (yearMap.get(yearKey) || 0) + amount);
        });

        // Chuyển đổi Map thành mảng sắp xếp theo thời gian
        result.week.data = Array.from(weekMap, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
        result.month.data = Array.from(monthMap, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
        result.quarter.data = Array.from(quarterMap, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
        result.year.data = Array.from(yearMap, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));

        return { EC: 0, EM: "Lấy thống kê doanh thu thành công!", DT: result };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi truy vấn", DT: {} };
    }
};


// Hàm lấy số tuần trong năm
const getWeekNumber = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstJan) / 86400000) + firstJan.getDay() + 1) / 7);
};

// Lấy số tháng trong năm (định dạng YYYY-MM)
const getMonthKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
};

// Lấy số quý trong năm (định dạng YYYY-QX)
const getQuarterKey = (date) => {
    return `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
};

// Lấy số năm (định dạng YYYY)
const getYearKey = (date) => {
    return `${date.getFullYear()}`;
};

// --------------------------------------------------
export default {
    getDoctorBookingStats,
    getDoctorPatientStats,
    getDoctorRevenueStats
};
