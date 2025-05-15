import db from '../models/index';
import formatUtils from '../utils/formatUtil';

// --------------------------------------------------
const getMedicalHistoryPage = async (req, res) => {
    try {
        const history = await db.History.findAll({
            include: [
                { model: db.Booking,
                    include: [
                        { model: db.Patient },
                        { model: db.Schedule, include: [{ model: db.Doctors, include: [{ model: db.User }] }] }
                    ],
                },
            ],
            raw: true,
            nest: true
        })

        history.forEach((record, index) => {
            console.log(`----- Lịch sử khám #${index + 1} -----`);
            console.log(`ID: ${record.id}`);
            console.log(`Ngày tạo: ${record.createdAt}`);
            console.log(`Bệnh nhân: ${record.Booking?.Patient?.name}`);
            console.log(`Bác sĩ: ${record.Booking?.Schedule?.Doctor?.User?.name}`);
            console.log(`----------------------------------`);
        });
        

        // const totalHistories = history.filter(hi => formatUtils.formatDate(hi.date) === formattedToday);
        return res.render('layouts/layout', {
            page: `pages/medicalHistoryPage.ejs`,
            pageTitle: 'Lịch sử khám',
            history: history,
            // totalHistories: totalHistories,
        })
    } catch (error) {
        console.error(error)
    }
}
// --------------------------------------------------
export default {
    getMedicalHistoryPage
}