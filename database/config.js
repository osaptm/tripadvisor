const mongoose = require('mongoose');
require('dotenv').config();
const IP_SERVER = process.env.IP_SERVER;
const OPCIONES_MONGO = process.env.OPCIONES_MONGO;
const USER_MONGO = process.env.USER_MONGO;
const PASS_MONGO = process.env.PASS_MONGO;
const db_tripadvisor_all = async() => {
    try {
        mongoose.set('strictQuery', false);          
        mongoose.connect('mongodb://'+USER_MONGO+':'+PASS_MONGO+'@'+IP_SERVER+':27017/tripadvisor_all'+OPCIONES_MONGO, {
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
        mongoose.connect('mongodb://'+USER_MONGO+':'+PASS_MONGO+'@'+IP_SERVER+':27017/tripadvisor_x_ciudad'+OPCIONES_MONGO, {
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

