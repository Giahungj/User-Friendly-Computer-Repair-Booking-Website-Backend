import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

const authMiddleware = (req, res, next) => {
	const token = req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.locals.adminName = null;
		res.locals.adminId = null;
		return res.render('pages/not-logged-in');
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded.role !== "admin") {
			res.locals.adminName = null;
			res.locals.adminId = null;
			return res.render('pages/not-logged-in');
		}
		req.admin = decoded;
		res.locals.adminName = decoded.name;
		res.locals.adminId = decoded.id;
		next();
	} catch (error) {
		res.locals.adminName = 'Người dùng ẩn danh';
		res.locals.adminId = null;
		res.clearCookie("adminToken");
		return res.render('pages/not-logged-in');
	}
};


export default authMiddleware;

