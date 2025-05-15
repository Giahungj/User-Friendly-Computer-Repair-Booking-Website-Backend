import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
    node: 'http://localhost:9200', // Dùng tên service trong Docker
});
esClient.ping()
    .then(() => console.log('Elasticsearch kết nối thành công'))
    .catch(err => console.log('Elasticsearch không thể kết nối', err));
export default esClient;