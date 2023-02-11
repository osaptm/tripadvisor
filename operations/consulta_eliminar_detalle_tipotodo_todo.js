const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const consulta_eliminar_detalle_tipotodo_todo = async () => {
    
    await dbConnection();
    const array_idrecursos = [ "63e2cd161c94f0581e0f12da", "63e2cd161c94f0581e0f12de", "63e2cd171c94f0581e0f12e2", "63e2cd7b7c8e10c9e094d5ee", "63e2cd7b7c8e10c9e094d5f2", "63e2cd7c7c8e10c9e094d5f6", "63e2cd7f7c8e10c9e094d612", "63e2cd925a859147e4aebdba", "63e2cdacc174005ef434b765", "63e2cdadc174005ef434b76d", "63e2cdadc174005ef434b771", "63e2cdb0c174005ef434b789", "63e2cdc3b457b07198911c01", "63e2cdc4b457b07198911c05", "63e2cdc4b457b07198911c09", "63e2cdc5b457b07198911c11", "63e2cdc7b457b07198911c19", "63e2cdc7b457b07198911c1d", "63e2cde4c0a97a66d4960181", "63e2cdfb4384b6529dbe4547", "63e2cdfc4384b6529dbe454b", "63e2cdfc4384b6529dbe454f", "63e2cdfd4384b6529dbe4553", "63e2cdfe4384b6529dbe455f", "63e2cdff4384b6529dbe4563", "63e2ce47d4cf45a7fad14346", "63e2ce48d4cf45a7fad1434a", "63e2ce48d4cf45a7fad1434e", "63e2ce4cd4cf45a7fad1436a"];


        for (let index = 0; index < array_idrecursos.length; index++) {
            const idrecurso = array_idrecursos[index];
            await mongo.Detalle_tipotodo_todo.deleteMany({ idtipotodo_pais: ObjectId(idrecurso) }); 
            await mongo.Pagina.updateMany({ idrecurso: ObjectId(idrecurso)}, {$set : {estado_scrapeo_page: 'PENDING'} });
            console.log("Eliminado y Paginas en Pending "+idrecurso);
        }
    

}

module.exports = {
    consulta_eliminar_detalle_tipotodo_todo
}

