const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno


const consulta_copiar_paginas_autogeneradas = async () => {
    await dbConnection();
    //await mongo.Pagina.deleteMany({url_anterior : "Autogenerado"});
    const consulta = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'FINALIZADO' });
    if (consulta.length !== 0) {
        for (let index = 0; index < consulta.length; index++) {
            const paginas = await mongo.Pagina.find({ idrecurso: consulta[index]._id });
            const enteroPag = Math.ceil(consulta[index].todos_to_scrape / 30) || 1;
            if (enteroPag !== paginas.length) {
                console.log(consulta[index]._id + ` Paginas Previstas ${enteroPag} / ${paginas.length} ` + consulta[index].url);
                const paginas_auto = await mongo.Pagina_autogenerada.find({ idrecurso: consulta[index]._id });
                if(paginas_auto.length !==0 ){
                    for (pagi of paginas_auto) {
                        const existe = await mongo.Pagina.findOne({ idrecurso: pagi.idrecurso, url_actual:pagi.url_actual, numero_actual:pagi.numero_actual });
                        if(existe === null){
                            const data_ = {
                                url_actual: pagi.url_actual,
                                url_anterior: "Autogenerado",
                                numero_actual: pagi.numero_actual,
                                numero_anterior: (pagi.numero_actual-1),
                                idrecurso: ObjectId(pagi.idrecurso)
                              }
                              const Pagina = new mongo.Pagina(data_);
                              await Pagina.save();
                        }
                    }
                }
            }else{
                //console.log(consulta[index]._id + ` OK ${enteroPag} / ${paginas.length} ` + consulta[index].url);
            }
        }
        process.exit();
    }

}

module.exports = {
    consulta_copiar_paginas_autogeneradas
}


