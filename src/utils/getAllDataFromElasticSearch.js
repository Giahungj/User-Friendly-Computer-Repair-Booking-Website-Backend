import esClient from '../services/elasticsearch';

const getAllDoctorsData = async () => {
    try {
        const result = await esClient.search({
            index: 'doctors', // Sử dụng index 'doctors' giống syncAllData
            size: 10000       // Số lượng tối đa
        });
        return result.hits.hits; // Trả về dữ liệu nếu cần sử dụng tiếp
    } catch (error) {
        console.error('Error getting data:', error);
        throw error;
    }
};

const getAllPatientsData = async () => {
    try {
        const result = await esClient.search({
            index: 'patients', // Sử dụng index 'doctors' giống syncAllData
            size: 10000       // Số lượng tối đa
        });
        return result.hits.hits; // Trả về dữ liệu nếu cần sử dụng tiếp
    } catch (error) {
        console.error('Error getting data:', error);
        throw error;
    }
};

const getAllFacilitiesData = async () => {
    try {
        const result = await esClient.search({
            index: 'facilities',
            size: 10000
        });
        return result.hits.hits;
    } catch (error) {
        console.error('Error getting facilities data:', error);
        throw error;
    }
};

const getAllSpecialtiesData = async () => {
    try {
        const result = await esClient.search({
            index: 'specialties',
            size: 10000
        });
        return result.hits.hits;
    } catch (error) {
        console.error('Error getting specialties data:', error);
        throw error;
    }
};

export default {
    getAllDoctorsData,
    getAllPatientsData,
    getAllFacilitiesData,
    getAllSpecialtiesData
};
