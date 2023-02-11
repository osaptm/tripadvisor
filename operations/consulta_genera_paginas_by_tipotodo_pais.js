const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const consulta_genera_paginas_by_tipotodo_pais = async () => {
    
    await dbConnection();
    const consulta = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'INWORKER' });
    if (consulta.length !== 0) {
        for (let index = 0; index < consulta.length; index++) {            
            const enteroPag = Math.ceil(consulta[index].todos_to_scrape / 30) || 1;
            if(enteroPag === 1){                
                  const Pagina = new mongo.Pagina_autogenerada({
                    url_actual: consulta[index].url,
                    numero_actual: 1,
                    idrecurso: consulta[index]._id
                  });
                  await Pagina.save();
            }else{
                const cantidad_por_pagina = 30;
                const url = consulta[index].url;
                const idrecurso = consulta[index]._id;
                let nueva_url = "";                

                if(url!==""){
                    const Pagina = new mongo.Pagina_autogenerada({
                        url_actual: url,
                        numero_actual: 1,
                        idrecurso: idrecurso
                      });
                    await Pagina.save();
                }

                for (let index = 1; index < enteroPag; index++) {
                    nueva_url = ""; 
                    const codigo_url_oa0 = url.match(/\-oa0-/);
                    if(codigo_url_oa0 !== null){
                       nueva_url = url.replace(/\-oa0-/,`-oa${cantidad_por_pagina*index}-`);
                    }else{
                        const codigo_url_c = url.match(/\-c\d+\-/);
                        if(codigo_url_c !== null){
                            nueva_url = url.replace(/(\-c\d+\-)/,`$1oa${cantidad_por_pagina*index}-`);
                        }
                    }
                    if(nueva_url!==""){
                        const Pagina = new mongo.Pagina_autogenerada({
                            url_actual: nueva_url,
                            numero_actual: (index+1),
                            idrecurso: idrecurso
                          });
                        await Pagina.save();
                    }
                     
                }
            }
        }
    }else{
        console.log("NO HAY TIPOTODO X PAIS EN ESTADO INWORKER")
    }

}

module.exports = {
    consulta_genera_paginas_by_tipotodo_pais
}

