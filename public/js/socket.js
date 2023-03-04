const socket = io();

socket.on("result_scrapea_info", (res_json) => {
    let res = JSON.parse(res_json)
    if (res.msj === 'OK') {
        console.log(res.msj);
        document.getElementById('body_modal_scrapeo_informacion').innerHTML = 'SCRAPEO CORRECTO!';
        document.getElementById('modal_scrapeo_informacion_btn_x').style.display = 'block';
        document.getElementById('modal_scrapeo_informacion_btn_close').style.display = 'block';


        let atraccionAUX = Object.assign({}, res.atraccion);
        if (atraccionAUX.fotos?.datos) atraccionAUX.fotos = atraccionAUX?.fotos.datos;
        if (atraccionAUX.breadcrumbs?.datos) atraccionAUX.breadcrumbs = atraccionAUX?.breadcrumbs.datos;
        if (atraccionAUX.disfrutar?.datos) atraccionAUX.disfrutar = atraccionAUX?.disfrutar.datos;
        delete atraccionAUX._id;
        delete atraccionAUX.h1_page;
        delete atraccionAUX.__v;
        delete atraccionAUX.publicado;
        delete atraccionAUX.cantidad_scrapeado
        delete atraccionAUX.estado_scrapeo_comentarios
        delete atraccionAUX.estado_scrapeo

        const html_atracciones = `<div class='card_atraccion'>
        <h5> * ${atraccionAUX.nombre} </h5>      
            <details class='details_init'>
                <summary>VER INFORMACION</summary>
                ${viewProperties(atraccionAUX)}
            </details>
        </div>`;
        document.getElementById('body_modal_scrapeo_informacion').innerHTML = html_atracciones

    } else {
        console.log(res.msj)
    }
});

socket.on("result_scrapea_reviews", (res_json) => {
    let res = JSON.parse(res_json)
    if (res.msj === 'OK') {
        console.log(res.msj)
    } else {
        console.log(res.msj)
    }

    document.getElementById('body_modal_scrapeo_reviews').innerHTML = 'EN DESARROLLO';
    document.getElementById('modal_scrapeo_reviews_btn_x').style.display = 'block';
    document.getElementById('modal_scrapeo_reviews_btn_close').style.display = 'block';
});

function scrapea_info(id_atraccion) {
    if(confirm("Esta seguro de Scrapear?")){

        document.getElementById('body_modal_scrapeo_informacion').innerHTML = `<div id="modal_scrapeo_informacion_spinner" class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
    
        document.getElementById('modal_scrapeo_informacion_btn_x').style.display = 'none';
        document.getElementById('modal_scrapeo_informacion_btn_close').style.display = 'none';
        socket.emit("scrapea_info", id_atraccion);

    }
}

function scrapea_reviews(id_atraccion) {
    document.getElementById('body_modal_scrapeo_reviews').innerHTML = `<div id="modal_scrapeo_informacion_spinner" class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;

    document.getElementById('modal_scrapeo_reviews_btn_x').style.display = 'none';
    document.getElementById('modal_scrapeo_reviews_btn_close').style.display = 'none';
    socket.emit("scrapea_reviews", id_atraccion);
}