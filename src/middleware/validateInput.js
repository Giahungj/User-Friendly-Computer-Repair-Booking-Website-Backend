const validateSpecialtyData = (req, res, next) => {
    const { specialtyName, specialtyDescription, oldImage } = req.body;
    const specialtyImage = req.file ? req.file.filename : oldImage;

    if (!specialtyName || !specialtyDescription || !specialtyImage) {
        return res.status(400).json({ message: "Thiếu dữ liệu chuyên khoa hoặc hình ảnh!" });
    }
    next();
};

export default { validateSpecialtyData };

    