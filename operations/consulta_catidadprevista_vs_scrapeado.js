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
            const cantidad_esperada = consulta[index].todos_to_scrape;
            if (cantidad_esperada !== todos.length) {
                console.log(consulta[index]._id + ` Todos Previstos ${cantidad_esperada} / ${todos.length} ` + consulta[index].url);
            }
        }
    }

}

module.exports = {
    consulta_catidadprevista_vs_scrapeado
}

