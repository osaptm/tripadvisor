const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const consulta_eliminar_detalle_tipotodo_todo = async () => {

    await dbConnection();
    const array_idrecursos = [ 
        "63e2cdb0c174005ef434b789","63e2cd7f7c8e10c9e094d612",
        "63e2cdc7b457b07198911c1d","63e2cd1a1c94f0581e0f12fe",
        "63e2cdfe4384b6529dbe455f","63e2cdff4384b6529dbe4563",
        "63e2ce4cd4cf45a7fad1436a"];

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

