import express from "express";
import flash from "connect-flash";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import cors from "cors"; 
import { Server } from "socket.io";
import http from "http";
import syncData from "./utils/syncData";
// Import các middleware
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import flashMiddleware from "./middleware/flashMiddleware";

// Import cấu hình và kết nối CSDL
import connection from "./config/connectDB";
import configViewEngine from "./config/viewEngine";

// Import các route
import initWebRoutes from "./routes/web";
import initApiRoutes from "./routes/api";

// Load environment variables
dotenv.config();

const app = express();

// Tạo HTTP server bọc Express
const server = http.createServer(app);

// // Lắng nghe sự kiện "connection" từ Socket.io
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3000",  // Đảm bảo origin đúng với frontend
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
//     transports: ['websocket', 'polling'],  // Đảm bảo sử dụng đúng các phương thức transport
// });

// // Kết nối socket
// io.on("connection", (socket) => {
//     console.log("Kết nối thành công. ID kết nối:", socket.id);

//     socket.on("auth", (userId) => {
//         console.log(`User ${userId} đã đăng nhập.`);
//         socket.join(`user:${userId}`);
//         console.log(`Socket đã tham gia vào phòng: user:${userId}`);
//     });

//     socket.on("disconnect", () => {
//         console.log("Người dùng đã ngắt kết nối:", socket.id);
//     });
// });

// // Share io cho toàn bộ ứng dụng
// app.set("io", io);

// export const getIO = () => io;

// Middleware cấu hình cho Express
app.use(methodOverride('_method'));

// Cấu hình session
app.use(session({
	secret: 'anhdomixi',
	resave: false,
	saveUninitialized: true,
}));

// Cấu hình CORS
app.use(cors({
    origin: "http://localhost:3000", // Cho phép frontend React truy cập
    methods: "GET, POST, PUT, DELETE",
    credentials: true // Cho phép gửi cookie nếu có
}));

// Cấu hình flash messages
app.use(flash());
app.use(flashMiddleware);

// Xác định trang đăng nhập
app.use((req, res, next) => {
    res.locals.isLoginPage = req.path === "/admin/login"; 
    next();
});

// Middleware xử lý body, cookie và method override
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Cấu hình file static (tệp tĩnh)
app.use(express.static(path.join(__dirname, 'public')));

// Kiểm tra kết nối với cơ sở dữ liệu
connection();

// Cấu hình view engine cho Express (ví dụ EJS hoặc Pug)
configViewEngine(app);

// Khởi tạo các routes
initWebRoutes(app);
initApiRoutes(app);

// Khởi động cron job để kiểm tra dịch vụ hết hạn
import serviceApiService from "./services/serviceApiService";
serviceApiService.updateDoctorServiceStatus(); // Kiểm tra trạng thái dịch vụ

// Cấu hình port và khởi động server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Máy chủ đang chạy trên cổng: ${PORT}`);
});