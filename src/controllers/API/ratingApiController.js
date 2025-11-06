import ratingApiService from '../../services/API/ratingApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readRating = async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
			return res.status(400).json({
				EM: "Thiếu reviewId",
				EC: -1,
				DT: []
			});
		}
        const result = await ratingApiService.getRating(reviewId);
        if (result.EC !== 0) {
			return res.status(200).json({
				EM: "Không tìm thấy đánh giá nào",
				EC: 0,
				DT: []
			});
		}
        return res.status(result.EC === 0 ? 200 : result.EC === -1 ? 404 : 400).json(result);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server', DT: {} });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readRatingsForStoreManager = async (req, res) => {
    try {
        const { storeManagerId } = req.params;
        if (!storeManagerId) {
			return res.status(400).json({
				EM: "Thiếu storeManagerId",
				EC: -1,
				DT: []
			});
		}
        const result = await ratingApiService.ratingsForStoreManager(storeManagerId);
        if (result.EC !== 0) {
			return res.status(200).json({
				EM: "Không tìm thấy đánh giá nào",
				EC: 0,
				DT: []
			});
		}
        return res.status(result.EC === 0 ? 200 : result.EC === -1 ? 404 : 400).json(result);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server', DT: {} });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readTechnicianRatings = async (req, res) => {
    try {
        const technicianId = parseInt(req.params.id);
        if (!technicianId) {
			return res.status(400).json({
				EM: "Thiếu technicianId",
				EC: -1,
				DT: []
			});
		}
        const result = await ratingApiService.readTechnicianRatings(technicianId);
        if (result.EC !== 0) {
			return res.status(200).json({
				EM: "Không tìm thấy đánh giá nào",
				EC: 0,
				DT: []
			});
		}
        return res.status(result.EC === 0 ? 200 : result.EC === -1 ? 404 : 400).json(result);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server', DT: {} });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleCraeteNewRating = async (req, res) => {
	try {
		const { booking_id, customer_id, technician_id, rating, comment } = req.body;
		const images = req.files;

		if (!booking_id || !customer_id || !technician_id || !rating) {
			return res.status(400).json({
				EM: "Thiếu dữ liệu bắt buộc",
				EC: -1,
				DT: [],
			});
		}

		// Chuẩn hoá đường dẫn ảnh trước khi gửi xuống service
		const imagePaths = images?.map((f) => `/uploads/${f.filename}`) || [];

		console.log("📄 Dữ liệu nhận được từ client:");
		console.log("Booking ID:", booking_id);
		console.log("Customer ID:", customer_id);
		console.log("Technician ID:", technician_id);
		console.log("Rating:", rating);
		console.log("Comment:", comment || "(Không có nhận xét)");
		console.log("Ảnh đính kèm:", imagePaths);

		const result = await ratingApiService.createNewRating({
			booking_id,
			customer_id,
			technician_id,
			rating,
			comment,
			images: imagePaths,
		});

		return res.status(result.EC === 0 ? 200 : 400).json(result);
	} catch (error) {
		console.error("❌ Lỗi khi tạo đánh giá:", error);
		return res.status(500).json({
			EM: "Lỗi server",
			EC: -1,
			DT: [],
		});
	}
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
	readRating,
	readRatingsForStoreManager,
    readTechnicianRatings,
    handleCraeteNewRating,
}