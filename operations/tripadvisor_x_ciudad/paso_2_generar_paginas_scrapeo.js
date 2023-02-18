const { db_tripadvisor_x_ciudad } = require('../../database/config');
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;

async function gerera_url_ciudad_x_categoria_atraccion(url_ciudad, identificador){    
    let nueva_url = url_ciudad.replace('-oa0-','-');
    nueva_url = nueva_url.replace(/(\-Activities\-)/,`$1${identificador}-`);
    return nueva_url;
}

async function paso_2_generar_paginas_scrapeo(){

    try {
        // NUEVA CONEXION MONGO
        await db_tripadvisor_x_ciudad();
        // PRIMERO INSERTAR DETALLE ENTRE CIUDADES Y CATEGORIAS_ATRACTIVOS
        const array_ciudades = await mongo.Ciudad.find({});
        const array_categoria_atraccion = await mongo.Categorias_atraccion.find({});

       for (let index = 0; index < array_ciudades.length; index++) {
            const ciudad = array_ciudades[index];
            for (let f = 0; f < array_categoria_atraccion.length; f++) {
                const categoria_atraccion = array_categoria_atraccion[f];
                const existe_detalle = await mongo.Categoria_atraccion_ciudad.findOne({id_categoira_atraccion:categoria_atraccion._id, id_ciudad:ciudad._id});
                if(existe_detalle) continue;
                const url_autogenerada = await gerera_url_ciudad_x_categoria_atraccion(ciudad.url_tripadvisor, categoria_atraccion.identificador);
                await mongo.Categoria_atraccion_ciudad.create([{id_categoira_atraccion:categoria_atraccion._id, id_ciudad:ciudad._id, url: url_autogenerada}]);                
            }    
       }

        // TENEMOS QUE OBTENER EL NUMERO DE ATRACCIONES POR CADA Categoria_atraccion_ciudad PARA GENERAR SU PAGINACION
        
        

        process.exit();
    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

};

module.exports = paso_2_generar_paginas_scrapeo;