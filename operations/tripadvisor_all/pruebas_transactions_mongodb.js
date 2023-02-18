const {  mongoose , Schema, model} = require('mongoose');
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno
const assert = require('assert');

const pruebas_transactions_mongodb = async () => {

    await dbConnection();

    const User = model('User', new Schema({ name: String }));

    let session = null;
    return User.createCollection().
        then(() => mongoose.startSession()).
        then(_session => {
            session = _session;
            session.startTransaction();
            return User.create({ name: 'foo' },{session});
        }).
        then(() => {
           
            return User.findOne({ name: 'foo' }).session(session);
        }).
        then(user => {
            // Getter/setter for the session associated with this document.
            console.log("Existe user? ", user);
            user.name = 'bar';
            // By default, `save()` uses the associated session
            return user.save();
        }).
        then(() => User.findOne({ name: 'bar' })).
        // Won't find the doc because `save()` is part of an uncommitted transaction
        then(doc => {
            console.log("se grabo ", doc);
        }).
        then(() => session.commitTransaction()).
        then(() => session.endSession()).
        then(() => User.findOne({ name: 'bar' })).
        then(doc => {
            console.log("Existe user? ", doc);
        });


}

module.exports = {
    pruebas_transactions_mongodb
}

