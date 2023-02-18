const { db_tripadvisor_x_ciudad } = require('../../database/config');
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;

async function gerera_url_ciudad_x_categoria_atraccion(url_ciudad, identificador){    
    let nueva_url = url_ciudad.replace('-oa0-','-');
    nueva_url = nueva_url.replace(/(\-Activities\-)/,`$1${identificador}-`);
    return nueva_url;
}

async function paso_4(){

    try {
        // NUEVA CONEXION MONGO
        await db_tripadvisor_x_ciudad();

        const consulta = await mongo.Categoria_atraccion_ciudad.find({});

        if (consulta.length !== 0) {
            for (let index = 0; index < consulta.length; index++) {            
                const enteroPag = Math.ceil(consulta[index].numero_atracciones / 30);
                let existe = null;
                //console.log(consulta[index].url)
                if(enteroPag === 0) { continue; }
                if(enteroPag === 1){                    

                    existe = await mongo.Pagina.findOne({
                        url_actual: consulta[index].url,
                        numero_actual: 1,
                        id_categoria_atraccion_ciudad: consulta[index]._id
                    });   

                    if(existe) continue;
                    
                    await mongo.Pagina.create([{
                    url_actual: consulta[index].url,
                    numero_actual: 1,
                    id_categoria_atraccion_ciudad: consulta[index]._id
                    }]);

                }else{
                    const cantidad_por_pagina = 30;
                    const url = consulta[index].url;
                    const idrecurso = consulta[index]._id;
                    let nueva_url = "";                
    
                    if(url!==""){
                       
                        existe = await mongo.Pagina.findOne({
                            url_actual: url,
                            numero_actual: 1,
                            id_categoria_atraccion_ciudad: idrecurso
                        });   

                        if(!existe) {
                            await mongo.Pagina.create([{
                            url_actual: url,
                            numero_actual: 1,
                            id_categoria_atraccion_ciudad: idrecurso
                            }]);
                         }

                    }
    
                    for (let index = 2; index <= enteroPag; index++) {
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
                           
                            existe = await mongo.Pagina.findOne({
                                url_actual: nueva_url,
                                numero_actual: index,
                                id_categoria_atraccion_ciudad: idrecurso
                            });   
    
                            if(!existe) {
                                await mongo.Pagina.create([{
                                url_actual: url,
                                numero_actual: index,
                                id_categoria_atraccion_ciudad: idrecurso
                                }]);
                             }else{
                                await mongo.Pagina.updateOne({_id:existe._id},{numero_actual: index});
                             }
                           
                        }
                         
                    }
                }
            }
        }else{
            console.log("NO HAY Categoria_atraccion_ciudad ")
        }
        
        console.log("Fin Tarea...")

        process.exit();
    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

};

module.exports = paso_4;