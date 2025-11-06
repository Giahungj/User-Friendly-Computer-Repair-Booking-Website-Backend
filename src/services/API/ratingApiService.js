import db from '../../models';
import { createHistory } from './historyApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getRating = async (reviewId) => {
    try {
        const rating = await db.Rating.findOne({
            where: { rating_id: reviewId },
            attributes: ['rating_id', 'technician_id', 'booking_id', 'customer_id', 'rating', 'comment', 'images', 'createdAt', 'updatedAt'],
            raw: true, nest: true,
        });

        if (!rating) {
            return { EC: -1, EM: 'Không tìm thấy đánh giá', DT: {} };
        }
        return { EC: 0, EM: 'Lấy thông tin đánh giá thành công', DT: rating };
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return { EC: -1, EM: 'Lỗi server', DT: {} };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const ratingsForStoreManager = async (storeManagerId) => {
    try {
        const technicians = await db.Technician.findAll({
            attributes: ['technician_id'],
            include: [{
                attributes: [],
                model: db.Store,
                where: { store_manager_id: storeManagerId },
            }],
            raw: true,
            nest: true,
        });
        const technicianIds = technicians.map(t => t.technician_id);
        const ratings = await db.Rating.findAll({
            where: { technician_id: technicianIds },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: db.Technician,
                    attributes: ['technician_id', 'avg_rating'],
                    include: [
                        {
                            model: db.User,
                            attributes: ['name', 'avatar'],
                        },
                    ],
                },
                {
                    model: db.RepairBooking, attributes: [],
                    include: [
                        {
                            model: db.Customer,
                             include: [
                                {
                                    model: db.User,
                                    attributes: ['name', 'avatar'],
                                },
                            ],
                        },
                    ],
                },
            ],
            raw: true,
            nest: true,
        });

        if (!ratings) {
            return { EC: -1, EM: 'Không tìm thấy đánh giá nào', DT: [] };
        }

        const formattedRatings = ratings.map(({ RepairBooking, ...r }) => ({
            ...r,
            Customer: RepairBooking?.Customer || null,
            images: r.images ? JSON.parse(r.images) : [],
        }));

        return { EC: 0, EM: 'Lấy danh sách đánh giá thành công', DT: formattedRatings };
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return { EC: -1, EM: 'Lỗi server', DT: {} };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTechnicianRatings = async (technicianId) => {
    try {
        const ratings = await db.Rating.findAll({
            where: { technician_id: technicianId },
            attributes: ['rating_id', 'rating', 'comment', 'images', 'createdAt', 'updatedAt'],
            include: [{
                model: db.Technician, attributes: [],
                include: [{
                    model: db.User,
                    attributes: ['name', 'avatar'],
                }]
            }],
            raw: true, nest: true,
            order: [['updatedAt', 'DESC']], // Sắp xếp đánh giá mới nhất trước
        });

        if (!ratings || ratings.length === 0) {
            return { EC: -1, EM: 'Không tìm thấy đánh giá', DT: [] };
        } 
    
        return { EC: 0, EM: 'Thành công', DT: ratings };
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return { EC: -1, EM: 'Lỗi server', DT: {} };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const createNewRating = async (newRatingData) => {
    const t = await db.sequelize.transaction();
    try {
        const { booking_id, customer_id, technician_id, rating, comment, images } = newRatingData;

        // Thêm mới vào bảng Rating
        const newRating = await db.Rating.create(
            {
                booking_id,
                customer_id,
                technician_id,
                rating,
                comment,
                images: JSON.stringify(images || []),
            },
            { transaction: t }
        );

        // Lấy lại dữ liệu vừa thêm kèm thông tin user
        const createdRating = await db.Rating.findOne({
            where: { rating_id: newRating.rating_id },
            attributes: ["rating_id", "rating", "comment", "images", "createdAt", "updatedAt"],
            include: [
                {
                    model: db.Technician,
                    attributes: ["technician_id"],
                    include: [
                        {
                            model: db.User,
                            attributes: ["name", "avatar"],
                        },
                    ],
                },
            ],
            raw: true,
            nest: true,
            transaction: t,
        });

        const createdHistory = await createHistory({ bookingId: booking_id, notes: 'Bạn đã đánh giá đơn hàng.' });
        if (createdHistory.EC !== 0) {
            console.error('Lỗi khi tạo lịch sử thao tác:', createdHistory.EM);
        }

        await t.commit();

        return {
            EC: 0,
            EM: "Thêm mới đánh giá thành công",
            DT: createdRating,
        };
    } catch (error) {
        await t.rollback();
        console.error("❌ Lỗi khi thêm đánh giá:", error);
        return {
            EC: -1,
            EM: "Lỗi server khi thêm mới đánh giá",
            DT: {},
        };
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getRating,
    ratingsForStoreManager,
    readTechnicianRatings,
    createNewRating,
}