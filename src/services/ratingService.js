import { raw } from "body-parser";
import db from "../models";

// ---------------------------------------------------------
const getPatientRatings = async (patientId) => {
    try {
        const ratings = await db.Rating.findAll({
            where: { patientId: patientId },
            include: [{
                model: db.Doctors,
                include: [{ model: db.User }]
            }],
            raw: true,
            nest: true
        });
        
        return { EM: "", EC: 0, DT: ratings };
    } catch (error) {
        console.error(error);
        return { EM: "Something wrong from service!!!", EC: -1, DT: [] };
    }
}

// ---------------------------------------------------------
const getDoctorRatings = async (doctorId) => {
    try {
        // Tính avgScore từ tất cả ratings
        const allRatings = await db.Rating.findAll({
            where: { doctorId },
            attributes: ['score'],
            raw: true
        });
        const totalScore = allRatings.reduce((sum, item) => sum + item.score, 0);
        const avgScore = allRatings.length > 0 ? (totalScore / allRatings.length).toFixed(1) : 0;

        // Lấy 10 ratings mới nhất kèm thông tin liên quan
        const ratings = await db.Rating.findAll({
            where: { doctorId },
            include: [{
                model: db.Patient,
                include: [{ model: db.User }]
            }],
            limit: 10,
            order: [['createdAt', 'DESC']],
            raw: true,
            nest: true
        });

        return { EM: "", EC: 0, DT: { ratings, avgScore } };
    } catch (error) {
        console.error(error);
        return { EM: "Something wrong from service!!!", EC: -1, DT: [] };
    }
}

// ---------------------------------------------------------
export default {
    getPatientRatings, getDoctorRatings
}