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

(async () => {

    try {
        console.log("INICIAMOS TAREAS");
        // const { scrapea_atracciones_x_pagination_autogenerada } = require('./operations/scrapea_atracciones_x_pagination_autogenerada');
        // await scrapea_atracciones_x_pagination_autogenerada();

        const {consulta_eliminar_detalle_tipotodo_todo} = require('./operations/consulta_eliminar_detalle_tipotodo_todo');
        await consulta_eliminar_detalle_tipotodo_todo();

        const { scrapea_atracciones_x_pagination_para_corregir } = require('./operations/scrapea_atracciones_x_pagination_para_corregir');
        await scrapea_atracciones_x_pagination_para_corregir();

        // const {consulta_catidadprevista_vs_scrapeado} = require('./operations/consulta_catidadprevista_vs_scrapeado');
        // consulta_catidadprevista_vs_scrapeado();

        // const {scrapea_data_x_todo} = require('./operations/scrapea_data_x_todo');
        // scrapea_data_x_todo();

    
        
    } catch (error) {
        console.log("FINALIZAMOS TAREAS");
        process.exit();
    }

})();
