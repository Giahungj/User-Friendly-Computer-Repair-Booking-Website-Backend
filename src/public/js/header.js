document.addEventListener('DOMContentLoaded', function () {
    // Lắng nghe sự kiện nhấn Enter trong ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const keyword = this.value.trim();
                if (keyword) {
                    window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
                }
            }
        });
    }

    // Hiệu ứng hover cho header
    const header = document.getElementById('mainHeader');
    if (header) {
        header.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        header.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
    }

    // Hiệu ứng hover cho thông tin người dùng
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e9ecef';
            this.style.transform = 'translateY(-2px)';
        });
        userInfo.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.transform = 'translateY(0)';
        });
    }

    // Hiệu ứng hover cho nút đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('mouseenter', function() {
            this.querySelector('.btn-hover-effect').style.left = '0';
        });
        logoutBtn.addEventListener('mouseleave', function() {
            this.querySelector('.btn-hover-effect').style.left = '-100%';
        });
    }

    // Chức năng tìm kiếm: Hiển thị/ẩn nút xóa khi nhập nội dung
    const clearSearch = document.getElementById('clearSearch');
    if (searchInput && clearSearch) {
        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                clearSearch.classList.remove('d-none');
            } else {
                clearSearch.classList.add('d-none');
            }
        });

        clearSearch.addEventListener('click', function() {
            searchInput.value = ''; // Làm trống ô tìm kiếm
            this.classList.add('d-none'); // Ẩn nút xóa
            searchInput.focus(); // Đặt lại con trỏ vào ô tìm kiếm
        });
    }
});
