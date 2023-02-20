const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { workerData } = require('worker_threads');
const { db_tripadvisor_x_ciudad } = require('../../database/config'); // Base de Datoos Mongo
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config();

// Variable requeridas
const proxyUrl = 'http://prueba:123@' + workerData.ip_proxy;
const tiempo_espera = 30000;


async function mainWorker() {
  try {
    await db_tripadvisor_x_ciudad();
    // Accedemos a mongo para traer pagina actual y numero
    const url = workerData.url;
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
    // Esoeramos por el selector unos 2 segundos para saber si hay informacion
    const ninguna_atraccion = await page.$(".yCeTE");   

    if(ninguna_atraccion) {
      let title_ninguna_atraccion =  await (await ninguna_atraccion.getProperty('textContent')).jsonValue();
      if(title_ninguna_atraccion.includes('Ninguna atracción') || title_ninguna_atraccion.includes('Prueba otros filtros')){
        console.log(`${workerData.contador_trabajos} ->  ${workerData.nameWorker} - [ 0 ] - ${url}`);
        process.exit();
      }
    }

    try {
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_WebSortDisclaimer']", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar Al Inicio -> Elemento .jemSU[data-automation='WebPresentation_WebSortDisclaimer']");
      await page.reload();
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_WebSortDisclaimer']", { timeout: tiempo_espera });
    }

    const elemento = await page.$(".jemSU[data-automation='WebPresentation_WebSortDisclaimer']")
    const info = await elemento.$(".biGQs");
    let title_ =  await (await info.getProperty('textContent')).jsonValue();
    title_ = title_.replaceAll(",","");
    let firstNumber = 0;
    if(title_.includes("Más de")){
      const elemento_paginacion = await page.$(".jemSU[data-automation='WebPresentation_PaginationLinksList']")
      const infoPaginas = await elemento_paginacion.$(".uYzlj > .biGQs");
      title_ =  await (await infoPaginas.getProperty('textContent')).jsonValue();
      title_ = title_.replaceAll(",","");
      const separa  = title_.split("de");
      firstNumber = Number(separa[2]);
    }else{
      firstNumber = Number(title_.match(/\d+/)[0]);
    }   
   
     
     console.log(`${workerData.contador_trabajos} ->  ${workerData.nameWorker} - ${firstNumber} - ${url}`);     
     await mongo.Categoria_atraccion_ciudad.updateOne({ _id: ObjectId(workerData.iddetalle) }, { $set: { numero_atracciones: firstNumber } });

    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    console.log('ERROR EN MAIN '+workerData.ip_proxy, workerData.url, error);
    await page.close();
    await browser.close();
    process.exit();

  } 

}
/************************************************************/
/************************************************************/
mainWorker();
