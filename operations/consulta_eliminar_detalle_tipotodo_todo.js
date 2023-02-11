const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const consulta_eliminar_detalle_tipotodo_todo = async () => {

    await dbConnection();
    const array_idrecursos = [ "63e2cc58d907c58050596c4a","63e2cc5cd907c58050596c6e","63e2ccfe21469f079735997d","63e2cdc8b457b07198911c25","63e2ce004384b6529dbe456b"];


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

