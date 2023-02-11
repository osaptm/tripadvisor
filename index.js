// const {scrapea_paginas_mas_atractivos_x_paises} = require('./operations/scrapea_paginas_mas_atractivos_x_paises');
// scrapea_paginas_mas_atractivos_x_paises();

// const {consulta_catidadprevista_vs_scrapeado} = require('./operations/consulta_catidadprevista_vs_scrapeado');
// consulta_catidadprevista_vs_scrapeado();

(async ()=>{

    const {consulta_eliminar_detalle_tipotodo_todo} = require('./operations/consulta_eliminar_detalle_tipotodo_todo');
    await consulta_eliminar_detalle_tipotodo_todo();
    
    const {scrapea_atracciones_x_pagination_para_corregir} = require('./operations/scrapea_atracciones_x_pagination_para_corregir');
    await scrapea_atracciones_x_pagination_para_corregir();

})();
