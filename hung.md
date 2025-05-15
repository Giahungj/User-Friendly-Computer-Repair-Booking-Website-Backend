(3) Controller: Nhận dữ liệu đã xử lý và hiển thị
    Controller không cần lo xử lý logic, chỉ render hoặc trả kết quả cuối cùng.    
(2) APIController: Chuẩn hóa dữ liệu, xử lý lỗi
    APIController chịu trách nhiệm chuẩn hóa kết quả, không để Controller xử lý lỗi.
(1) Service: Xử lý nghiệp vụ và trả dữ liệu thô
    Service chỉ xử lý logic, không quan tâm đến format hay cách hiển thị dữ liệu.

3️⃣ Tổng kết
Service: Chỉ xử lý business logic (tương tác database).
FRONTEND - APIController: Chuẩn hóa dữ liệu, xử lý lỗi trước khi trả về. ✅ (Xử lý kết quả tốt nhất ở đây!)
BACKEND - Controller: Chỉ render giao diện hoặc trả JSON cho client.

#'0': 'success',     // Thành công
#'-1': 'error',      // Lỗi
#'1': 'warning',     // Cảnh báo
#'2': 'info',        // Thông tin
#'3': 'question'     // Câu hỏi
