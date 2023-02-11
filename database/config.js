const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect( 'mongodb://osaptm:123@130.211.205.75:27017/tripadvisor_paises?authMechanism=DEFAULT&authSource=admin', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        throw new Error('Error a la hora de iniciar la base de datos');
    }
}

module.exports = {
    dbConnection
}