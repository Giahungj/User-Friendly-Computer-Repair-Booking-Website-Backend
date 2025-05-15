const esClient = require('../services/elasticsearch');

async function testConnection() {
  try {
    const response = await esClient.cluster.health();
    console.log('Full response:', response);
    console.log('Elasticsearch health status:', response.status);
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
}

testConnection();
