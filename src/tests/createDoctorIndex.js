const esClient = require('../services/elasticsearch');

async function createDoctorIndex() {
  try {
    const response = await esClient.indices.create({
      index: 'doctor',
      mappings: {
        properties: {
          name: { type: 'text' },
          specialty: { type: 'text' },
          experience: { type: 'integer' },
          phone: { type: 'keyword' }
        }
      }
    });

    console.log('Doctor index created:', response);
  } catch (error) {
    console.error('Error creating doctor index:', error.meta.body.error);
  }
}

createDoctorIndex();
