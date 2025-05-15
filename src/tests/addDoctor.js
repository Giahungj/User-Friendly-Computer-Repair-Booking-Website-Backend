const esClient = require('../services/elasticsearch');

async function addDoctor() {
  try {
    const response = await esClient.index({
      index: 'doctor',
      document: {
        name: 'Dr. Tran Van B',
        specialty: 'Cardiology',
        experience: 10,
        phone: '0987654321'
      }
    });

    console.log('Added doctor:', response);
  } catch (error) {
    console.error('Error adding doctor:', error.meta.body.error);
  }
}

addDoctor();
