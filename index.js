const { db_tripadvisor_x_ciudad } = require('./database/config');
const mongo = require('./models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;

(async () => {

    try {

        // const paso_2 = require('./operations/tripadvisor_x_ciudad/paso_2_generar_paginas_scrapeo');
        // await paso_2();

        // const paso_3 = require('./operations/tripadvisor_x_ciudad/paso_3_scrapea_nroatraccions');
        // await paso_3();

        // const paso_4 = require('./operations/tripadvisor_x_ciudad/paso_4_generar_paginacion');
        // await paso_4();

        // const paso_5 = require('./operations/tripadvisor_x_ciudad/paso_5_scrapea_atracciones_x_pagination');
        // await paso_5();

        // const paso_6 = require('./operations/tripadvisor_x_ciudad/paso_6_consulta_catidadprevista_vs_scrapeado');
        // await paso_6();

        const paso_7 = require('./operations/tripadvisor_x_ciudad/paso_7_scrapea_data_x_atraccion');
        await paso_7();

        // await db_tripadvisor_x_ciudad();
        //await mongo.Pagina.updateMany({},{$set:{estado_scrapeo_page:'PENDING'}});

    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

})();

