import specialtyApiService from '../../services/API/specialtyApiService';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const readSpecialties = async (req, res) => {
    try {
        const result = await specialtyApiService.getAllSpecialties();
        const EM = result?.EM ?? 'Không xác định';
        const EC = result?.EC ?? 1;
        const DT = Array.isArray(result?.DT) ? result.DT : [];
        return res.status(200).json({ EM, EC, DT });
    } catch (error) {
        console.error('Error in readSpecialties:', error?.message || error);
        return res.status(500).json({
            EM: "Lỗi server",
            EC: 1,
            DT: []
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    readSpecialties,
}