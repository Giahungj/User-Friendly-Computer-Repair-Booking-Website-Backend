import { where } from 'sequelize/lib/sequelize';
import scheduleApiService from '../../services/scheduleApiService';
import doctorService from '../../services/doctorService';
// --------------------------------------------------
const readSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        let { schedule, bookings } = await scheduleApiService.getSchedules(scheduleId);
        return res.status(200).json({
            EM: "Lấy lịch trình thành công",
            EC: 0,
            DT: { schedule, bookings }
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const readTimeslotsNotInScheduleByScheduleId = async (req, res) => { // 
    try {
        const scheduleId = req.query.scheduleId
        const date = req.query.date
        const userId = req.query.userId
        const data = await scheduleApiService.getTimeslotsNotInScheduleByScheduleId(scheduleId, userId, date);
        return res.status(200).json({
            EM: "Lấy danh sách khung giờ khả dụng để cập nhật thành công!",
            EC: 0,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const readSchedulesOfDoctor = async (req, res) => {
    try {
        const userId = req.params.userId;
        const date = req.query.date || "";
        const data = await scheduleApiService.getSchedulesOfDoctor(userId, date);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const readSchedulesAndTimeSlotOfDoctor = async (req, res) => {
    try {
        const userId = req.params.userId;
        const date = req.query.date || "";
        const data = await scheduleApiService.getSchedulesAndTimeSlotOfDoctor(userId, date);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const createSchedules = async (req, res) => {
    try {
        const { schedules } = req.body;
        
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return res.status(400).json({ message: "Danh sách schedule không hợp lệ!" });
        }
        
        const newSchedules = await scheduleApiService.createSchedules(schedules);
        return res.status(201).json({
            EM: newSchedules.EM,
            EC: newSchedules.EC,
            DT: newSchedules.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
const updateSchedule = async (req, res) => {
    try {
        const scheduleData = req.body;
        const { id, doctorId, timeSlotId, maxNumber } = scheduleData;
        if (!id || !doctorId || !timeSlotId || !maxNumber) {
            return res.status(400).json({
                EM: "Thiếu các trường bắt buộc (id, doctorId, timeSlotId, maxNumber)!",
                EC: 1,
                DT: []
            });
        }
        const updatedSchedule = await scheduleApiService.updateSchedule(scheduleData);
        return res.status(200).json({
            EM: updatedSchedule.EM || "Cập nhật lịch thành công!",
            EC: updatedSchedule.EC || 0,
            DT: updatedSchedule.DT || []
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
};

// --------------------------------------------------
export default {
    readSchedule,
    readSchedulesOfDoctor,
    readSchedulesAndTimeSlotOfDoctor,
    readTimeslotsNotInScheduleByScheduleId,

    createSchedules,
    updateSchedule
} 