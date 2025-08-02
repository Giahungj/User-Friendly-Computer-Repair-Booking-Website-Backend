import esClient from '../services/elasticsearch';

const getAllTechniciansData = async () => {
	try {
		const result = await esClient.search({
			index: 'technicians',
			size: 10000
		});
		return result.hits.hits;
	} catch (error) {
		console.error('Error getting technicians data:', error);
		throw error;
	}
};

const getAllCustomersData = async () => {
	try {
		const result = await esClient.search({
			index: 'customers',
			size: 10000
		});
		return result.hits.hits;
	} catch (error) {
		console.error('Error getting customers data:', error);
		throw error;
	}
};

const getAllDevicesData = async () => {
	try {
		const result = await esClient.search({
			index: 'devices',
			size: 10000
		});
		return result.hits.hits;
	} catch (error) {
		console.error('Error getting devices data:', error);
		throw error;
	}
};

const getAllRepairBookingsData = async () => {
	try {
		const result = await esClient.search({
			index: 'repair_bookings',
			size: 10000
		});
		return result.hits.hits;
	} catch (error) {
		console.error('Error getting repair bookings data:', error);
		throw error;
	}
};

export default {
	getAllTechniciansData,
	getAllCustomersData,
	getAllDevicesData,
	getAllRepairBookingsData
};
