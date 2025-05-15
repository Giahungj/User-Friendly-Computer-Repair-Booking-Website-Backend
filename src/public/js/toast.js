// <% if (EM && EM.trim() !== '') { %>
//     <script>
//         let EC = '<%= EC %>';  // Lấy giá trị của EC từ server
//         const iconMap = {
//             '0': 'success',     // Thành công
//             '-1': 'error',      // Lỗi
//             '1': 'warning',     // Cảnh báo
//             '2': 'info',        // Thông tin
//             '3': 'question'     // Câu hỏi
//         };
//         const iconType = iconMap[EC] || 'info';
//         window.addEventListener('load', () => {
//             Swal.fire({
//                 title: 'Thông báo!',
//                 text: '<%= EM %>',
//                 icon: iconType,
//                 confirmButtonText: 'OK',
//             });
//         });
//     </script>
// <% } %>