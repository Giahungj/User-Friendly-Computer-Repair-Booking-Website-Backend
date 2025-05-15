document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("cretaeScheduleForm"); 
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const date = document.getElementById("scheduleDay").value; 
        const doctorId = form.querySelector('input[name="doctorId"]').value; 
        const timeSlotCheckboxes = form.querySelectorAll('input[name="timeSlotId"]:checked');
        const timeSlotId = Array.from(timeSlotCheckboxes).map(checkbox => checkbox.value);
        const maxNumberInputs = document.querySelectorAll('#timeInputs input[type="number"]');
        const maxNumber = Array.from(maxNumberInputs).map(input => input.value);
        const fieldData = {
            date: date,
            doctorId: doctorId,
            timeSlotId: timeSlotId,
            maxNumber: maxNumber   
        };

        try {
            const response = await fetch('/schedule/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fieldData) 
            });
            
            const result = await response.json();
            const iconMap = {
                '0': 'success',
                '-1': 'error',
                '1': 'warning',
                '2': 'info',
                '3': 'question'
            };
            Swal.fire({
                title: 'Thông báo!',
                text: result.EM || 'Đã có lỗi xảy ra',
                icon: iconMap[result.EC] || 'info',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu:", error);
        }
    });
});