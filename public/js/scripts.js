var urlBase = "http://localhost:8080/";
function viewProperties(obj, iden = 1) {
    let propertiesHtml = '';
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === 'object') {
                propertiesHtml += `<details style='margin-left:${iden * 5}px'>
                <summary>${property.toUpperCase()}</summary>
                <p>${viewProperties(obj[property], iden + 1)}</p>
                </details>`;
            } else {
                propertiesHtml += `<p style='margin-left:${iden * 10}px'><b>${property.toUpperCase()}:</b> ${obj[property]}</p>`;
            }
        }
    }
    return propertiesHtml;
}

function limpiar(id) {
    switch (id) {
        case "resultados_blog":
            document.getElementById(id).innerHTML = `
            <div id="paises"></div>
                    <div id="resultados_paises">
                        <div id="ciudades"></div>
                        <div id="resultados_ciudades">
                            <div id="categorias"></div>
                            <div id="resultados_categorias">
                                <div id="atracciones"></div>
                            </div>
                        </div>
                    </div>`;
            break;
        case "resultados_paises":
            document.getElementById(id).innerHTML = `<div id="ciudades"></div>
                <div id="resultados_ciudades">
                    <div id="categorias"></div>
                    <div id="resultados_categorias">
                        <div id="atracciones"></div>
                    </div>
                </div>`;
            break;
        case "resultados_ciudades":
            document.getElementById(id).innerHTML = `<div id="categorias"></div>
            <div id="resultados_categorias">
                <div id="atracciones"></div>
            </div>`;
            break;
        case "resultados_categorias":
            document.getElementById(id).innerHTML = `<div id="atracciones"></div>`;
            break;
        case "atracciones":
            document.getElementById(id).innerHTML = ``;
            break;
        case "body_comentarios":
            document.getElementById(id).innerHTML = ``;
            break;

        default:
            document.location.reload();
            break;
    }
}

function creaHTML_ciudades(obj) {
    let html = "";
    obj.ciudades.forEach((ciudad) => {

        let json_value = JSON.stringify({
            id_blog: obj.id_blog,
            id_ciudad: ciudad._id,
        });

        html += `<option value='${json_value}'>[${ciudad.publicado} / ${ciudad.total_atracciones}] - ${ciudad.nombre}</option>`;

    });

    html = `<select id="select_ciudad" class="form-select" aria-label="Ciudad" onchange="getCategorias(this.value)">                    
        <option value="null" selected>Seleccione Ciudad</option> ${html}
        </select>`;

    document.getElementById('ciudades').innerHTML = html;
}

async function getAtracciones(selectObject, pagina_actual = 1) {
    limpiar('atracciones'); let objeto = selectObject;
    if (selectObject.includes("*")) objeto = selectObject.replaceAll('*', '"');
    let value = JSON.parse(objeto);
    if (value === null) { console.log("Error Null Inesperado"); return; }
    if (value.id_ciudad === null || value.id_blog === null) { console.log("Ciudad o Blog es Null"); return; }

    let registros_x_pagina = 10;
    let total_registros = value.total;
    let numero_paginas = Math.ceil(total_registros / registros_x_pagina);
    let paginas_muestra = 5;


    const atracciones_blog = await fetch(urlBase + 'back/atracciones_blog/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_blog: value.id_blog,
            id_ciudad: value.id_ciudad,
            id_categoria: value.id_categoria,
            pagina: (pagina_actual - 1),
            registros_x_pagina: registros_x_pagina,
        })
    });

    if (atracciones_blog.status === 400) {
        alert("Error fetch back/atracciones_blog/");
        limpiar('atracciones');
        return;
    }

    const atracciones_blog_json = await atracciones_blog.json();

    if (atracciones_blog_json.atracciones.length === 0) { limpiar('atracciones'); alert("No Hay Atracciones"); return; }


    let inicio_paginacion = (pagina_actual < paginas_muestra) ? 1 : pagina_actual;
    let html_li = ""; let contador = 0;

    const selectObject_ = {
        id_blog: value.id_blog,
        id_ciudad: value.id_ciudad,
        id_categoria: value.id_categoria,
        total: value.total
    }
    const cadena = JSON.stringify(selectObject_).replaceAll('"', "*");

    for (let index = inicio_paginacion; index <= numero_paginas; index++) {
        let active = ""; contador++; let href = ``;
        href = ` onclick = "getAtracciones('${cadena}', ${index})" `;
        if (index === pagina_actual) { active = "active"; href = "'#'"; }
        if (contador <= paginas_muestra) html_li += `<li class="page-item ${active}"><a class="page-link" ${href} >${index}</a></li>`;
    }


    let boton_atras = '#';
    let boton_adelante = '#';
    if (inicio_paginacion - 1 !== 0) boton_atras = ` onclick = "getAtracciones('${cadena}', ${inicio_paginacion - 1})" `;
    if (inicio_paginacion + 1 <= numero_paginas) boton_adelante = ` onclick = "getAtracciones('${cadena}', ${inicio_paginacion + 1})" `;

    let li_atras = `<li class="page-item">
        <a class="page-link" ${boton_atras} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`;

    let li_adelante = `<li class="page-item">
    <a class="page-link" ${boton_adelante} aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
    </a>
    </li>`;

    let pagination = `<nav aria-label="Page navigation example">
                        <ul class="pagination justify-content-center">
                        ${li_atras}
                        ${html_li}
                        ${li_adelante}
                        </ul>
                    </nav>`;

    let html_atracciones = "";
    atracciones_blog_json.atracciones.forEach((atraccion) => {

        let atraccionAUX = Object.assign({}, atraccion);;
        if(atraccionAUX.fotos?.datos) atraccionAUX.fotos = atraccionAUX?.fotos.datos;
        if(atraccionAUX.breadcrumbs?.datos) atraccionAUX.breadcrumbs = atraccionAUX?.breadcrumbs.datos;
        if(atraccionAUX.disfrutar?.datos) atraccionAUX.disfrutar = atraccionAUX?.disfrutar.datos;
        delete atraccionAUX._id;
        delete atraccionAUX.h1_page;
        delete atraccionAUX.publicado;
        delete atraccionAUX.nombre;
        delete atraccionAUX.cantidad_comentarios

        html_atracciones += `<div class='card_atraccion' onmouseover="ver_botones('botones_atraccion_${atraccion._id}',1)" 
        onmouseout="ver_botones('botones_atraccion_${atraccion._id}',0)">

        <h5> * ${atraccion.nombre} [Reviews ${atraccion.cantidad_comentarios}] ${atraccion.publicado === 0 ? '' : 'PUBLICADO'}</h5>
        
        <div style='display:none' class='botones_atraccion' id='botones_atraccion_${atraccion._id}'>
            <button style="font-size:10px" onclick="getComentarios('${atraccion._id}',1,${atraccion.cantidad_comentarios})" type="button" data-bs-toggle="modal" data-bs-target="#modal_comentarios" class="btn btn-primary btn-sm">Ver Comentarios</button>
            <button style="font-size:10px" type="button" class="btn btn-secondary btn-sm">Gestionar Contenido</button>
        </div>

        <details class='details_init'>
        <summary>VER INFORMACION</summary>
        ${viewProperties(atraccionAUX)}
        </details>
        </div>`;

    });
    document.getElementById('atracciones').innerHTML = pagination + '<br>' + html_atracciones
}


async function getComentarios(id_atraccion, pagina_actual = 1, total = 0) {
    limpiar('body_comentarios'); 
    if (id_atraccion === null) { console.log("Error Null Inesperado"); return; }
    if (total === 0) { console.log("Sin Comentarios"); return; }

    let registros_x_pagina = 5;
    let total_registros = total;
    let numero_paginas = Math.ceil(total_registros / registros_x_pagina);
    let paginas_muestra = 5;

    const comentarios = await fetch(urlBase + 'back/comentarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_atraccion: id_atraccion,
            pagina: (pagina_actual - 1),
            registros_x_pagina: registros_x_pagina,
        })
    });

    if (comentarios.status === 400) {
        alert("Error fetch back/comentarios/");
        limpiar('body_comentarios');
        return;
    }

    const comentarios_json = await comentarios.json();

    if (comentarios_json.length === 0) { limpiar('body_comentarios'); alert("No Hay Comments"); return; }


    let inicio_paginacion = (pagina_actual < paginas_muestra) ? 1 : pagina_actual;
    let html_li = ""; let contador = 0;
    for (let index = inicio_paginacion; index <= numero_paginas; index++) {
        let active = ""; contador++; let href = ``;
        href = ` onclick = "getComentarios('${id_atraccion}', ${index}, ${total})" `;
        if (index === pagina_actual) { active = "active"; href = "'#'"; }
        if (contador <= paginas_muestra) html_li += `<li class="page-item ${active}"><a class="page-link" ${href} >${index}</a></li>`;
    }

    let boton_atras = '#';
    let boton_adelante = '#';
    if (inicio_paginacion - 1 !== 0) boton_atras = ` onclick = "getComentarios('${id_atraccion}', ${inicio_paginacion - 1}, ${total})" `;
    if (inicio_paginacion + 1 <= numero_paginas) boton_adelante = ` onclick = "getComentarios('${id_atraccion}', ${inicio_paginacion + 1}, ${total})" `;

    let li_atras = `<li class="page-item">
        <a class="page-link" ${boton_atras} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`;

    let li_adelante = `<li class="page-item">
    <a class="page-link" ${boton_adelante} aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
    </a>
    </li>`;

    let pagination = `<nav aria-label="Page navigation example">
                        <ul class="pagination justify-content-center">
                        ${li_atras}
                        ${html_li}
                        ${li_adelante}
                        </ul>
                    </nav>`;

    let html_comentarios = "";
    comentarios_json.forEach((comentario) => {       

        html_comentarios += `<div class='card_atraccion' onmouseover="ver_botones('botones_comentario_${comentario._id}',1)" 
        onmouseout="ver_botones('botones_comentario_${comentario._id}',0)">

        <h5> * ${comentario.usuario} 
            <div style="display:none" id="botones_comentario_${comentario._id}">
                <button style="font-size:10px" type="button" class="btn btn-secondary btn-sm">EDITAR</button>
                <button style="font-size:10px" type="button" class="btn btn-primary btn-sm">BORRAR</button>
            </div>
        </h5>
        
        <p style="font-size:10px">${comentario.mensaje}</p>
        </div>`;

    });
    document.getElementById('body_comentarios').innerHTML = pagination + '<br>' + html_comentarios
}

function ver_botones(id, estado){
    if(estado===1) document.getElementById(id).style.display='block';
    if(estado===0) document.getElementById(id).style.display='none';
}

async function getCategorias(selectObject) {
    limpiar('resultados_categorias');
    let value = JSON.parse(selectObject);
    if (value === null) { console.log("Error Null Inesperado"); return; }
    if (value.id_ciudad === null || value.id_blog === null) { console.log("Ciudad o Blog es Null"); return; }

    const categorias = await fetch(urlBase + 'back/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_blog: value.id_blog,
            id_ciudad: value.id_ciudad,
        })
    });

    if (categorias.status === 400) {
        alert("Error back/categorias/");
        limpiar('resultados_categorias');
        return;
    }

    const categorias_json = await categorias.json();

    if (categorias_json.categorias.length === 0) { limpiar('resultados_categorias'); alert("No Hay Categorias"); return; }
    let html = '';
    categorias_json.categorias.forEach((categoria) => {

        let json_value = JSON.stringify({
            id_blog: value.id_blog,
            id_ciudad: value.id_ciudad,
            id_categoria: categoria._id,
            total: categoria.total_atracciones
        });

        html += `<option value='${json_value}'>[${categoria.publicado} / ${categoria.total_atracciones}] - ${categoria.nombre}</option>`;

    });

    html = `<select id="select_ciudad" class="form-select" aria-label="Ciudad" onchange="getAtracciones(this.value)">                    
        <option value="null" selected>Seleccione Categoria</option> ${html}
        </select>`;

    document.getElementById('categorias').innerHTML = html;

}


async function getCiudad(selectObject) {
    limpiar('resultados_paises');
    let value = JSON.parse(selectObject);
    if (value === null) { console.log("Error Null Inesperado"); return; }
    if (value.id_pais === null || value.id_blog === null) { console.log("Pais o Blog es Null"); return; }

    const ciudades_blog = await fetch(urlBase + 'back/ciudades_blog/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_blog: value.id_blog,
            id_pais: value.id_pais,
            id_pais_blog: value.id_pais_blog
        })
    });

    if (ciudades_blog.status === 400) {
        alert("Error fetch back/ciudades_blog/");
        limpiar('resultados_paises');
        return;
    }
    const ciudades_blog_json = await ciudades_blog.json();
    if (ciudades_blog_json.ciudades.length === 0) { limpiar('resultados_paises'); alert("No Hay Ciudades"); return; }
    creaHTML_ciudades(ciudades_blog_json);

}

async function getPaises(selectObject) {
    limpiar('resultados_blog');
    let value = JSON.parse(selectObject);
    if (value === null) { return; }
    if (value.id_blog === null) return;

    const paises_blog = await fetch(urlBase + 'back/paises_blog/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_blog: value.id_blog,
            id_pais: value.id_pais
        })
    });

    if (paises_blog.status === 400) {
        alert("Error fetch back/paises_blog/");
        limpiar('resultados_blog');
        return;
    }
    const paises_blog_json = await paises_blog.json();
    if (paises_blog_json.paises.length === 0) { limpiar('resultado_blog'); alert("No Hay Paises"); return; }

    let html = "";
    paises_blog_json.paises.forEach((pais) => {

        let json_value = JSON.stringify({
            id_blog: paises_blog_json.id_blog,
            id_pais: pais._id,
            id_pais_blog: (pais.paisBlogs.length === 0 ? null : pais.paisBlogs[0]._id)
        });

        html += `<option value='${json_value}'>${pais.nombre} - Ciudades : ${pais.total_ciudades}</option>`;

    });

    const opcion_inicial = (paises_blog_json.paises.length === 1 ? "" : `<option value="null" selected>Seleccione Pais</option>`);

    html = `<select id="select_pais" class="form-select" aria-label="Pais" onchange="getCiudad(this.value)">                    
            ${opcion_inicial} ${html}
            </select>`;

    document.getElementById('paises').innerHTML = html;

    if (paises_blog_json.paises.length === 1) creaHTML_ciudades(paises_blog_json);

}