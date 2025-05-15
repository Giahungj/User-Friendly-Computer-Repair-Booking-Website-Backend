const esClient = require('../services/elasticsearch');

async function searchDoctor() {
  try {
    const response = await esClient.search({
      index: 'doctor',
      query: {
        match: { specialty: 'Cardiology' }
      }
    });
    console.log('Search results:', response.hits.hits);
  } catch (error) {
    console.error('Error searching doctor:', error.meta.body.error);
  }
}

searchDoctor();
