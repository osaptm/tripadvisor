const { db_tripadvisor_x_ciudad } = require('./database/config');
const mongo = require('./models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;

// const {scrapea_paginas_mas_atractivos_x_paises} = require('./operations/scrapea_paginas_mas_atractivos_x_paises');
// scrapea_paginas_mas_atractivos_x_paises();

// const {consulta_catidadprevista_vs_scrapeado} = require('./operations/consulta_catidadprevista_vs_scrapeado');
// consulta_catidadprevista_vs_scrapeado();

// const {consulta_eliminar_detalle_tipotodo_todo} = require('./operations/consulta_eliminar_detalle_tipotodo_todo');
// await consulta_eliminar_detalle_tipotodo_todo();

// const {scrapea_atracciones_x_pagination_para_corregir} = require('./operations/scrapea_atracciones_x_pagination_para_corregir');
// await scrapea_atracciones_x_pagination_para_corregir();

// const {consulta_genera_paginas_by_tipotodo_pais} = require('./operations/consulta_genera_paginas_by_tipotodo_pais');
// consulta_genera_paginas_by_tipotodo_pais();

// const { scrapea_atracciones_x_pagination_autogenerada } = require('./operations/scrapea_atracciones_x_pagination_autogenerada');
// await scrapea_atracciones_x_pagination_autogenerada();

// const {consulta_eliminar_detalle_tipotodo_todo} = require('./operations/consulta_eliminar_detalle_tipotodo_todo');
// await consulta_eliminar_detalle_tipotodo_todo();

// const { scrapea_atracciones_x_pagination_para_corregir } = require('./operations/scrapea_atracciones_x_pagination_para_corregir');
// await scrapea_atracciones_x_pagination_para_corregir();

// const {consulta_catidadprevista_vs_scrapeado} = require('./operations/consulta_catidadprevista_vs_scrapeado');
// consulta_catidadprevista_vs_scrapeado();

// const {scrapea_data_x_todo} = require('./operations/scrapea_data_x_todo');
// scrapea_data_x_todo();

(async () => {

    try {

        // const paso_2 = require('./operations/tripadvisor_x_ciudad/paso_2_generar_paginas_scrapeo');
        // await paso_2();

        // const paso_3 = require('./operations/tripadvisor_x_ciudad/paso_3_scrapea_nroatraccions');
        // await paso_3();

        // const paso_4 = require('./operations/tripadvisor_x_ciudad/paso_4_generar_paginacion');
        // await paso_4();

        const paso_5 = require('./operations/tripadvisor_x_ciudad/paso_5_scrapea_atracciones_x_pagination');
        await paso_5();

        // const paso_6 = require('./operations/tripadvisor_x_ciudad/paso_6_consulta_catidadprevista_vs_scrapeado');
        // await paso_6();

    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

})();

