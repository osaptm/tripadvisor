const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno


const consulta_paises_con_paginacion_erronea = async () => {
    await dbConnection();

    const consulta = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'FINALIZADO' });
    if (consulta.length !== 0) {
        for (let index = 0; index < consulta.length; index++) {
            const paginas = await mongo.Pagina.find({ idrecurso: consulta[index]._id });
            const enteroPag = Math.ceil(consulta[index].todos_to_scrape / 30) || 1;
            if (enteroPag !== paginas.length) {
                console.log(consulta[index]._id + ` Paginas Previstas ${enteroPag} / ${paginas.length} ` + consulta[index].url);
            }
        }
        process.exit();
    }

}

module.exports = {
    consulta_paises_con_paginacion_erronea
}


