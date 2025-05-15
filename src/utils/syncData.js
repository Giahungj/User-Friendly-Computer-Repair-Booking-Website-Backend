import esClient from '../services/elasticsearch';
import db from '../models'; // Import db để sử dụng model Doctors

const syncDoctorsData = async () => {
    try {
        // Lấy tất cả dữ liệu bác sĩ với các thông tin liên quan
        const doctors = await db.Doctors.findAll({
            include: [
                { model: db.User }, // Lấy thông tin User (name)
                { model: db.Specialty }, // Lấy thông tin Specialty (name)
            ],
            raw: true,
            nest: true
        });

        // Đồng bộ từng bác sĩ sang Elasticsearch
        for (const doctor of doctors) {
            await esClient.index({
                index: 'doctors',
                id: doctor.id.toString(),
                body: {
                    name: doctor.User.name, // Lấy tên từ User
                    specialty: doctor.Specialty.name // Lấy tên chuyên khoa từ Specialty
                    // Không bao gồm trường facility
                }
            });
        }
        console.log('Dữ liệu đã được đồng bộ thành công vào Elasticsearch!');
    } catch (error) {
        console.error('Error syncing data:', error);
        throw error;
    }
};

const syncFacilitiesData = async () => {
	try {
		const facilities = await db.Facility.findAll({ raw: true });

		for (const facility of facilities) {
			await esClient.index({
				index: 'facilities',
				id: facility.id.toString(),
				body: {
					name: facility.name,
					address: facility.address,
					phone: facility.phone,
                    mainImage: facility.mainImage 
                    ? 'http://localhost:8080/images/uploads/' + facility.mainImage 
                    : 'https://vstatic.vietnam.vn/vietnam/resource/IMAGE/2025/1/20/5a1dfb02bdd24e95ad866d54f8240f7e',
				}
			});
		}
		console.log('✅ Dữ liệu phòng khám đã được đồng bộ vào Elasticsearch!');
	} catch (error) {
		console.error('❌ Lỗi đồng bộ phòng khám:', error);
		throw error;
	}
};

const syncSpecialtiesData = async () => {
	try {
		const specialties = await db.Specialty.findAll({
            raw: true,
            where: { deleted: false }
        });


		for (const specialty of specialties) {
			await esClient.index({
				index: 'specialties',
				id: specialty.id.toString(),
				body: {
					name: specialty.name,
					image: specialty.image ? 'http://localhost:8080/images/uploads/' + specialty.image : '',
					description: specialty.description
				}
			});
		}
		console.log('✅ Dữ liệu chuyên khoa đã được đồng bộ vào Elasticsearch!');
	} catch (error) {
		console.error('❌ Lỗi đồng bộ chuyên khoa:', error);
		throw error;
	}
};

// Hàm khởi tạo mapping
const initializePatientsMapping = async () => {
    try {
        const indexExists = await esClient.indices.exists({ index: 'patients' });
        if (!indexExists) {
            console.log("📋 Index 'patients' chưa tồn tại, đang tạo với mapping...");
            await esClient.indices.create({
                index: 'patients',
                body: {
                    settings: {
                        "index.max_ngram_diff": 14,
                        analysis: {
                            analyzer: {
                                custom_ngram_analyzer: {
                                    tokenizer: 'custom_ngram_tokenizer',
                                    filter: ['lowercase']
                                },
                                custom_normalized_analyzer: { // Thêm analyzer mới
                                    tokenizer: 'keyword',
                                    filter: ['lowercase', 'asciifolding', 'normalize_whitespace']
                                }
                            },
                            tokenizer: {
                                custom_ngram_tokenizer: {
                                    type: 'ngram',
                                    min_gram: 2,
                                    max_gram: 15,
                                    token_chars: ['letter', 'digit']
                                }
                            },
                            filter: {
                                normalize_whitespace: {
                                    type: 'pattern_replace',
                                    pattern: '\\s+', // Thay tất cả khoảng trắng
                                    replacement: '' // Thành chuỗi liền
                                }
                            }
                        }
                    },
                    mappings: {
                        properties: {
                            id: { type: 'integer' },
                            User: {
                                properties: {
                                    id: { type: 'integer' },
                                    name: { 
                                        type: 'text',
                                        analyzer: 'custom_ngram_analyzer',
                                        fields: {
                                            keyword: { type: 'keyword' },
                                            normalized: { // Thêm field mới
                                                type: 'text',
                                                analyzer: 'custom_normalized_analyzer'
                                            }
                                        }
                                    }
                                }
                            },
                            doctors: { type: 'integer' }
                        }
                    }
                }
            });
            console.log("✅ Index 'patients' đã được tạo với mapping thành công!");
        } else {
            console.log("📋 Index 'patients' đã tồn tại, không cần tạo mới.");
        }
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo mapping cho index 'patients':", error);
        throw error;
    }
};

// Hàm xóa chỉ mục 'patients'
const deletePatientsIndex = async () => {
    try {
        // Kiểm tra xem index 'patients' có tồn tại không
        const indexExists = await esClient.indices.exists({ index: 'patients' });

        if (indexExists) {
            console.log("🗑️ Index 'patients' tồn tại, đang xóa...");
            await esClient.indices.delete({
                index: 'patients'
            });
            console.log("✅ Index 'patients' đã được xóa thành công!");
        } else {
            console.log("ℹ️ Index 'patients' không tồn tại, không cần xóa.");
        }
    } catch (error) {
        console.error("❌ Lỗi khi xóa index 'patients':", error);
        throw error; // Ném lỗi để xử lý ở cấp cao hơn nếu cần
    }
};

const syncPatientsData = async () => {
    try {
        const patients = await db.Patient.findAndCountAll({
            include: [{model: db.User}, {model: db.Booking, include: [{model: db.Schedule}]}], raw: true, nest: true});

        console.log(`🔄 Bắt đầu đồng bộ ${patients.count} bệnh nhân vào Elasticsearch...`);

        // Tạo danh sách { patientId, doctorId }
        let patientDoctorPairs = patients.rows
            .map(patient => ({
                patientId: patient.id,
                doctorId: patient.Bookings.Schedule.doctorId // Giả sử doctorId nằm trong Doctors.id
            }))
            .filter(item => item.doctorId !== null && item.doctorId !== undefined);
        let c = [...new Map(patientDoctorPairs.map(item => [item.doctorId, item])).values()]; // Loại bỏ trùng lặp theo doctorId

        // Nhóm theo patientId và lấy doctorId duy nhất
        const patientMap = {};
        patientDoctorPairs.forEach(item => {
            const { patientId, doctorId } = item;
            console.log("📋 patientDoctorPairs lấy patientId và doctorId: ",item)
            if (!patientMap[patientId]) {
                patientMap[patientId] = {
                    id: patientId,
                    User: {
                        id: patients.rows.find(p => p.id === patientId)?.User?.id,
                        name: patients.rows.find(p => p.id === patientId)?.User?.name
                    },
                    doctors: new Set()
                };
            }
            patientMap[patientId].doctors.add(doctorId);
        });

        console.log("📋 patientMap sau khi nhóm theo patientId:", patientMap); // In patientMap
        // Đồng bộ từng bệnh nhân vào Elasticsearch
        for (const patientId in patientMap) {
            const patient = patientMap[patientId];
            const document = {
                id: patient.id,
                User: patient.User,
                doctors: Array.from(patient.doctors) // Chuyển Set thành mảng
            };

            await esClient.index({
                index: 'patients',
                id: patient.id.toString(),
                body: document
            });
        }

        console.log('🎉 Hoàn thành quá trình đồng bộ bệnh nhân vào Elasticsearch!');
    } catch (error) {
        console.error('Error syncing patient data:', error);
    }
};

export default { 
    syncDoctorsData, 
    syncFacilitiesData,
    syncSpecialtiesData,
    syncPatientsData, 
    deletePatientsIndex, 
    initializePatientsMapping 
};