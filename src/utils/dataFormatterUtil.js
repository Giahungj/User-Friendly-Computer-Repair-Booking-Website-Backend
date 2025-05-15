const moment = require('moment')
async function countToday(datesArray) {
    try {
        const today = moment().format('YYYY-MM-DD')
        const count = datesArray.filter(date => moment(date).format('YYYY-MM-DD') === today).length
        return count
    } catch (error) {
        console.error(error);
    }
}

export default {
    countToday
};
