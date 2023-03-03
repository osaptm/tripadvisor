const { db_tripadvisor_x_ciudad } = require('../../database/config'); // Base de Datoos Mongo
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const paso_6 = async () => {
    
    await db_tripadvisor_x_ciudad();
    const consulta = await mongo.Categoria_atraccion_ciudad.find({});
    if (consulta.length !== 0) {
        for (let index = 0; index < consulta.length; index++) {
            const todos = await mongo.Atraccion_x_categoria.find({ id_categoria_atraccion_ciudad: consulta[index]._id }); 
            const repetidos = await mongo.Atraccion_repetida.find({ id_categoria_atraccion_ciudad: consulta[index]._id });           
            const cantidad_esperada = consulta[index].numero_atracciones;
            const total_mas_repetidos = todos.length + repetidos.length;
            const resta = cantidad_esperada - total_mas_repetidos;
            if(cantidad_esperada !== total_mas_repetidos){
                if ( resta >= 1 || resta <= -1) {
                    await mongo.Pagina.updateMany({id_categoria_atraccion_ciudad : consulta[index]._id},{$set:{estado_scrapeo_page:'PENDING'}});
                    console.log(consulta[index]._id + ` ${cantidad_esperada} / ${total_mas_repetidos} = ${todos.length} + ${repetidos.length}`);
                    console.log(consulta[index].url)
                }
            }
        }
    }
    console.log("Fin tarea")
}

module.exports = paso_6

