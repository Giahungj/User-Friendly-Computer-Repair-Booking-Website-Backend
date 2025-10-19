if (EM && EM.trim() !== '') {
    let EC = EC_value; // thay bằng giá trị thực từ server
    const iconMap = {
            '0': 'success',
            '-1': 'error',
            '1': 'warning',
            '2': 'info',
            '3': 'question'
    };
    const iconType = iconMap[EC] || 'info';
    window.addEventListener('load', () => {
            Swal.fire({
                    title: 'Thông báo!',
                    text: EM,
                    icon: iconType,
                    confirmButtonText: 'OK',
            });
    });
}
