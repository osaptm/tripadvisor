const mongoose = require('mongoose');
const IP_SERVER = "35.225.155.60";
const OPCIONES_MONGO = "?directConnection=true&authMechanism=DEFAULT&authSource=admin&replicaSet=rs0&w=majority";

const db_tripadvisor_all = async() => {
    try {
        mongoose.set('strictQuery', false);          
        mongoose.connect('mongodb://osaptm:123@'+IP_SERVER+':27017/tripadvisor_all'+OPCIONES_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        throw new Error('Error init db_all_tripadvisor '+ error);
    }
}

const db_tripadvisor_x_ciudad = async() => {
    try {
        mongoose.set('strictQuery', false);          
        mongoose.connect('mongodb://osaptm:123@'+IP_SERVER+':27017/tripadvisor_x_ciudad'+OPCIONES_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        throw new Error('Error init db_tripadvisor_x_ciudad '+ error);
    }
}

module.exports = {
    db_tripadvisor_all,
    db_tripadvisor_x_ciudad
}

