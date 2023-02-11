const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const consulta_catidadprevista_vs_scrapeado = async () => {
    
    await dbConnection();
    const consulta = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'FINALIZADO' });
    if (consulta.length !== 0) {
        for (let index = 0; index < consulta.length; index++) {
            const todos = await mongo.Detalle_tipotodo_todo.find({ idtipotodo_pais: consulta[index]._id }); 
            const repetidos = await mongo.Todo_repetido.find({ idtipotodo_pais: consulta[index]._id });           
            const cantidad_esperada = consulta[index].todos_to_scrape;
            const total_mas_repetidos = todos.length + repetidos.length;
            if (cantidad_esperada !== total_mas_repetidos) {
                console.log(consulta[index]._id + ` ${cantidad_esperada} / ${total_mas_repetidos} = ${todos.length} + ${repetidos.length}`);
            }
        }
    }

}

module.exports = {
    consulta_catidadprevista_vs_scrapeado
}

