const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const mongo = require('../database/database');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
//const client = require('twilio')(accountSid, authToken);

// Variable requeridas
const array_proxy = ['196.196.220.155', '196.196.247.237', '5.157.55.218', '185.104.217.42'];
const positionIpProxy = Math.floor(Math.random() * array_proxy.length);
const ip_proxy = array_proxy[positionIpProxy];
const proxyUrl = 'http://prueba:123@' + ip_proxy;
const tiempo_espera = 30000;
/*************************************************/
// async function mensajeWhatsapp(mensaje){
//   const message = await client.messages.create({
//     from: 'whatsapp:+14155238886',
//     body: mensaje,
//     to: 'whatsapp:+51945441415'
//   });
//   console.log('Mensaje Enviado a Whatsapp',message.sid)
// }

async function scrapear_continente_tripadvisor() {
  try {
    //Iniciamos con unmensaje a whatsapp
    //await mensajeWhatsapp('Iniciamos Function scrapear_continente_tripadvisor()');
    // Accedemos a mongo para traer pagina actual y numero
    const ultimoElemento = await mongo.modeloPagina.findOne({}).sort({ _id: -1 });
    var paginaActualTripasvisor = ultimoElemento.numero_actual;
    const url = ultimoElemento.url_actual;
    const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
    // Abrimos un Navegador Chromiun
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] //  `--proxy-server=${newProxyUrl}` --> Proxy Sin usar otro paquete npm
    });
    // Una nueva pagina en Navegador
    const page = await browser.newPage();
    // Accedemos a la pagina
    await page.goto(url);
    // Esoeramos por el selector unos 5 segundos    

    try {
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar Al Inicio -> Elemento .jemSU[data-automation='WebPresentation_PaginationLinksList']");
      console.log(await page.title())
      await page.reload();
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    }

    // Buscamos si hay una siguiente pagina
    const objPaginaSiguiente = await buscarSiguientePagina(page, paginaActualTripasvisor, url);
    var paginaSiguiente = objPaginaSiguiente['paginaSiguiente'];
    var enlace = objPaginaSiguiente['enlace'];
    var idPagina = objPaginaSiguiente['idPagina'];
    /****************************/
    console.log(`URL = ${url}`);
    /****************************/
    //Recorremos Pagina x Pagina hasta el final 
    while (paginaSiguiente !== paginaActualTripasvisor && enlace!==null && idPagina!==null) {
      contador_errores = 0;
      paginaActualTripasvisor = paginaSiguiente;
      await extraeAtractivos(page, idPagina);
      // Siguiente Pagina
      /****************************/
      console.log(`URL = ${enlace}`);
      /****************************/
      await page.goto(enlace);
      //await page.waitForSelector(".DDJze[data-part='ListSections']", { timeout: tiempo_espera }); -> Por si no funciona lo siguiente

      try {
        await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
      } catch (error) {
        console.log("Error en Esperar en While -> Elemento .jemSU[data-automation='WebPresentation_PaginationLinksList']");
        await page.reload();
        await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
      }
      
      const obj = await buscarSiguientePagina(page, paginaActualTripasvisor, enlace);
      paginaSiguiente = obj['paginaSiguiente'];
      enlace = obj['enlace'];
      idPagina = obj['idPagina'];
    }
    // Cerrar Pagina - Cerrar Navegador y Terminar Proceso NODEJS
    //await mensajeWhatsapp('Finzaliza scrapear_continente_tripadvisor()');
    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    //await mensajeWhatsapp('Finaliza por Error -> scrapear_continente_tripadvisor()');
    console.log('Error en scrapear_continente_tripadvisor()', error);
    process.exit();

  }

}


async function buscarSiguientePagina(page, paginaActualTripasvisor, url) {
  try {
    // Buscamos la paginacion - para recorrer todo
    console.log("Pagina Actual Trip :" + paginaActualTripasvisor);
    try {
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar Buscar Pagina -> Elemento .jemSU[data-automation='WebPresentation_PaginationLinksList']");
      await page.reload();
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    }
    
    const divPaginacion = await page.$(".jemSU[data-automation='WebPresentation_PaginationLinksList']"); // > div > div:nth-of-type(1) > div > div:nth-of-type(2)
    //await page.waitForSelector(".nsTKv > a", { timeout: tiempo_espera });
    const numeracionPaginacion = await divPaginacion.$$(".nsTKv > a");

    for (let elementoEnlace of numeracionPaginacion) {
      const href = await (await elementoEnlace.getProperty('href')).jsonValue();
      const nro_pagina = await (await elementoEnlace.getProperty('textContent')).jsonValue();
      //console.log(">>>" , nro_pagina);
      if (Number(nro_pagina) === paginaActualTripasvisor + 1) {
        //console.log("Enlace ", href);
        // Generar la data a guardar
        const data = {
          url_actual: href,
          url_anterior: url,
          numero_actual: Number(nro_pagina),
          numero_anterior: paginaActualTripasvisor,
          error: '',
          html: ''
        }
        const Pagina = new mongo.modeloPagina(data);
        // Guardar DB
        await Pagina.save();
        // Return Final  
        return { paginaSiguiente: Number(nro_pagina), enlace: href, idPagina: Pagina._id };
      }
    }
    // Return Final  
    return { paginaSiguiente: paginaActualTripasvisor, enlace: null, idPagina: null };

  } catch (error) {

    //await mensajeWhatsapp('Error buscarSiguientePagina()');
    console.log('Error en buscarSiguientePagina', error);
    process.exit();

  }
}

async function extraeAtractivos(page, idPagina) {
  try {
    // Esoeramos por el selector unos 5 segundos    
    // Si no funciona usar esto -> await page.waitForSelector(".DDJze[data-part='ListSections']", { timeout: tiempo_espera });
    try {
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar extraeAtractivos -> Elemento .jemSU[data-automation='WebPresentation_PaginationLinksList']");
      await page.reload();
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
    }

    // Buscamos todos los elementos que coincidan
    const elements = await page.$$(".jemSU[data-automation='WebPresentation_SingleFlexCardSection']");
    // Recorrer todo el arreglo
    for (let element of elements) {
      const article = await element.$('article');
      const html_article = await (await article.getProperty('innerHTML')).jsonValue();
      const secondDiv = await element.$('article > div:nth-of-type(2)');
      const firstH3 = await secondDiv.$('h3');
      const firstA = await secondDiv.$('a:nth-of-type(1)');
      const h3Atractivo = await (await firstH3.getProperty('textContent')).jsonValue();
      const hrefAtractivo = await (await firstA.getProperty('href')).jsonValue();

      // console.log(h3Atractivo, hrefAtractivo);
      // Generar la data a guardar
      const data = {
        nombre: h3Atractivo,
        url: hrefAtractivo,
        html_inicial: html_article,
      }
      const Atractivo = new mongo.modeloAtractivo(data);
      // Guardar DB
      await Atractivo.save();
    }
    // El body para guardar una sola vez
    const htmlBody = await page.evaluate(() => { return document.body.innerHTML; });
    await mongo.modeloPagina.findByIdAndUpdate(idPagina, { html: htmlBody }, { new: false });

  } catch (error) {

    //await mensajeWhatsapp('Error extraeAtractivos()');
    console.log('Error en extraeAtractivos', error);
    process.exit();

  }
}
/************************************************************/
/************************************************************/
scrapear_continente_tripadvisor();
