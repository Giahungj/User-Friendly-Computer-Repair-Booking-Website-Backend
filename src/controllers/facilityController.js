import db from '../models/index';
import facilityService from '../services/facilityService';

// --------------------------------------------------
const renderFacilitiesPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1)
        const facilities = await facilityService.getAllFacility(page);
        return res.render('layouts/layout', {
            page: `pages/facilities/facilityList.ejs`,
            pageTitle: 'Quản lý phòng khám',
            facilities: facilities.DT.facilities,
            currentPage: page,
            totalPages: facilities.DT.totalPages,
        })
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const renderFacilityDetailPage = async (req, res) => {
    try {
        const facilityId = req.params.id
        const page = parseInt(req.query.page || 1)
        const facility = await facilityService.getFacilityById(facilityId, page)
        console.log("facility data:", facility.DT.facilityData);
        return res.render('layouts/layout', {
            page: `pages/facilities/facilityDetail.ejs`,
            pageTitle: 'Thông tin phòng khám',
            facility: facility.DT.facilityData,
            totalPages: facility.DT.totalPages,
            currentPage: page,
            total: facility.DT.total,
            doctors: facility.DT.doctors
        })
    } catch (error) {
        console.error(error);
        return res.render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Lỗi 404',
            EM: "Lỗi server ...",
            EC: -1,
        })
    }
}

// --------------------------------------------------
const createFacility = async (req, res) => {
    console.log('============================================================================');
	try {
		console.log('📥 Nhận dữ liệu từ client:', req.body);

        const data = req.body;
        const mainImage = req.files.mainImage?.[0]?.filename;
        const subImages = req.files.subImages || [];

        console.log('🖼️ Ảnh chính:', mainImage);
        console.log('🖼️ Ảnh phụ:', subImages.map(img => img.filename));

        const response = await facilityService.createFacility(data, mainImage, subImages);

        console.log('✅ Response từ service:', response);

        if (response.EC === 0) {
            // Thành công
            console.log('🎉 Tạo cơ sở thành công.');
            res.status(200).json({
                EM: response.EM || 'Thành công xảy ra khi tạo cơ sở.',
                EC: response.EC || 0
            });
        } else {
            // Thất bại
            console.log('❌ Lỗi khi tạo cơ sở:', response.EM);
            res.status(200).json({
                EM: response.EM || 'Có lỗi xảy ra khi tạo cơ sở.',
                EC: response.EC || 1
            });
        }
	} catch (error) {
        console.error('Error:', error);
        return res.send({
            EM: error || 'Lỗi nhiêm trọng!!!',
            EC: -1
        });
	}
    console.log('============================================================================');
};

// --------------------------------------------------
export default {
    createFacility,

    renderFacilitiesPage,
    renderFacilityDetailPage,
}