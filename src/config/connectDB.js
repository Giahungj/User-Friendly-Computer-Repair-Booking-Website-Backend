import Sequelize from "sequelize";

const sequelize = new Sequelize('repair_booking', 'root', null, {
    host: 'localhost', // Dùng tên service trong Docker
    dialect: 'mysql'

});

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Thiết lập kết nối cơ sở dữ liệu MySQL thành công.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connection;