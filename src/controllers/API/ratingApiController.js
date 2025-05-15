import { where } from 'sequelize/lib/sequelize';
import ratingApiService from '../../services/ratingApiService';

// ---------------------------------------------------------
const createRating = async (req, res) => {
    try {
        const { ratingData } = req.body;
        if (!ratingData) {
            return res.status(400).json({ message: "Đánh giá không hợp lệ!" });
        }
       
        const newRating = await ratingApiService.createRating(ratingData);
        return res.status(201).json({
            EM: newRating.EM,
            EC: newRating.EC,
            DT: newRating.DT
        });
    } catch (error) {
        console.error("Lỗi APIController:", error);
        return res.status(500).json({ EM: "Lỗi máy chủ", EC: -1, DT: [] });
    }
}

// ---------------------------------------------------------
export default {
    createRating
}