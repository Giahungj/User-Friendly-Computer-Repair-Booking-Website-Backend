import esClient from "../services/elasticsearch";

// ------------------------------------------------------------------------------------------------------------------
const searchDoctorsService = async (keyword) => {
		try {
            console.log("=======================================================================");
            console.log('🔍 [Bác sĩ] Bắt đầu tìm kiếm với keyword:', keyword);
            console.log("=======================================================================");
                    
            const response = await esClient.search({
                index: 'doctors',
                body: {
                    query: {
                        multi_match: {
                            query: keyword,
                            fields: ['name', 'specialty'],
                            type: 'best_fields'
                        }
                    }
                }
            });

            console.log("=======================================================================");
            console.log(`✅ [Bác sĩ] Tìm được ${response.hits.hits.length} kết quả`);
            console.log("=======================================================================");

            return { EC: 0, EM: '', DT: response.hits.hits || [] };
		} catch (error) {
				console.error('❌ [Bác sĩ] Lỗi tìm kiếm:', error);
				return { EC: 1, EM: error.message, DT: [] };
		}
};

// ------------------------------------------------------------------------------------------------------------------
const searchSpecialtiesService = async (keyword) => {
    try {
        console.log('🔍 [Chuyên khoa] Bắt đầu tìm kiếm với keyword:', keyword);
        const response = await esClient.search({
            index: 'specialties',
            body: {
                query: {
                    multi_match: {
                        query: keyword,
                        fields: ['name', 'description'],
                        type: 'best_fields',
                    },
                },
            },
        });
        console.log(`✅ [Chuyên khoa] Tìm được ${response.hits.hits.length} kết quả`);
        return { EC: 0, EM: '', DT: response.hits.hits || [] };
    } catch (error) {
        console.error('❌ [Chuyên khoa] Lỗi tìm kiếm:', error);
        return { EC: 1, EM: error.message, DT: [] };
    }
};

// ------------------------------------------------------------------------------------------------------------------
const searchFacilitiesService = async (keyword) => {
    try {
        console.log('🔍 [Cơ sở] Bắt đầu tìm kiếm với keyword:', keyword);
        const response = await esClient.search({
            index: 'facilities',
            body: {
                query: {
                    multi_match: {
                        query: keyword,
                        fields: ['name', 'address'],
                        type: 'best_fields',
                    },
                },
            },
        });
        console.log(`✅ [Cơ sở] Tìm được ${response.hits.hits.length} kết quả`);
        return { EC: 0, EM: '', DT: response.hits.hits || [] };
    } catch (error) {
        console.error('❌ [Cơ sở] Lỗi tìm kiếm:', error);
        return { EC: 1, EM: error.message, DT: [] };
    }
};

// ------------------------------------------------------------------------------------------------------------------
const searchPatientsService = async (keyword, doctorId) => {
    try {
        console.log("📥 Bắt đầu tìm kiếm với query:", keyword, doctorId);
        console.log("🔍 Gửi yêu cầu tìm kiếm đến Elasticsearch...");
        const response = await esClient.search({
            index: 'patients',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: { // Thay match bằng multi_match
                                    query: keyword,
                                    fields: ["User.name", "User.name.normalized"], // Tìm trên cả hai field
                                    fuzziness: "AUTO",
                                    operator: "and" // Yêu cầu tất cả từ trong query phải khớp
                                }
                            },
                            {
                                term: {
                                    "doctors": doctorId // Lọc theo doctorId = 4
                                }
                            }
                        ]
                    }
                }
            }
        });

        console.log("✅ Nhận phản hồi từ Elasticsearch, số kết quả:", response.hits.hits.length);
        console.log("📋 Dữ liệu trả về:", response.hits.hits);

        return { EC: 0, EM: "", DT: response.hits.hits };
    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm:", error);
        res.status(500).json({ error: error.message });
    }
};

// ------------------------------------------------------------------------------------------------------------------
export {
    searchDoctorsService,
    searchSpecialtiesService,
    searchFacilitiesService,
    searchPatientsService
};
