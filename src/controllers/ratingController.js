import formatUtils from '../utils/formatUtil';
import ratingService from '../services/ratingService';

// --------------------------------------------------
// const renderRatingPage = async (req, res) => {
//     try {
//         // const page = parseInt(req.quer.page || 1)
//         const data = await ratingService.getRating()
//         return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
//     } catch (error) {
//         console.error(error);
//         return res.render('layouts/layout', {
//             page: 'pages/errorPage.ejs',
//             pageTitle: 'Lỗi 404',
//             EM: "Lỗi server ...",
//             EC: -1,
//             DT: []
//         })
//     }
// }

// --------------------------------------------------
export default {
    // renderRatingPage,
}