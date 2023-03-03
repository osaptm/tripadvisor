const { db_tripadvisor_x_ciudad } = require('../../database//config');
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;
let url_tripadvisor= '', nombre= '', id_pais = '';
const paso_1 = async () => {

    try {
        // NUEVA CONEXION MONGO
        await db_tripadvisor_x_ciudad();
        // INSERTAMOS LAS CIUDADES AL PAIS CORRESPONDIENTE, IMPORTANTE ES EL ID_PAIS
         await mongo.Ciudad.create([       
        //{nombre:"",	url_tripadvisor:"", id_pais:ObjectId("")},
       ]);         
        console.log("Insert ciudades Exitoso");

    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

}

module.exports = paso_1