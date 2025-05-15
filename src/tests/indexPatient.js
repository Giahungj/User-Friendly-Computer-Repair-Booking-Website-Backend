const esClient = require('../services/elasticsearch');

async function indexPatient() {
  const patient = {
    name: "Nguyễn Văn A",
    age: 30,
    address: "Hà Nội",
    phone: "0987654321"
  };

  try {
    const response = await esClient.index({
      index: 'patient',
      body: patient
    });
    console.log('Index response:', response);
  } catch (error) {
    console.error('Error indexing patient:', error);
  }
}

indexPatient();
