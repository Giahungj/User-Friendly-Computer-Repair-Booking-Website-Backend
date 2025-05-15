import facilityApiService from '../../services/facilityApiService';

// --------------------------------------------------
const readFacilities = async (req, res) => {
    try {
        const data = await facilityApiService.getFacilityList();
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        })
    }
}

// --------------------------------------------------
const readFacilityDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await facilityApiService.getFacilityById(id);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        return res.status(200).json({
            EM: "Something wrong from server!",
            EC: "-1",
            DT: ""
        });
    }
};

// --------------------------------------------------
export default {
    readFacilities,
    readFacilityDetail
}