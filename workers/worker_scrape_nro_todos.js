const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { workerData } = require('worker_threads');
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config();

// Variable requeridas
const proxyUrl = 'http://prueba:123@' + workerData.ip_proxy;
const tiempo_espera = 30000;


async function mainWorker() {
  try {
    await dbConnection();
    // Accedemos a mongo para traer pagina actual y numero
    const url = workerData.url;
    const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
    // Abrimos un Navegador Chromiun
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${newProxyUrl}`] //  `--proxy-server=${newProxyUrl}` --> Proxy Sin usar otro paquete npm
    });
    // Una nueva pagina en Navegador
    const page = await browser.newPage();
    // Accedemos a la pagina
    await page.goto(url);
    // Esoeramos por el selector unos 5 segundos    
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
    title_ = title_.replace(",","");
    let firstNumber = 0;
    if(title_.includes("Más de")){
      const elemento_paginacion = await page.$(".jemSU[data-automation='WebPresentation_PaginationLinksList']")
      const infoPaginas = await elemento_paginacion.$(".uYzlj > .biGQs");
      title_ =  await (await infoPaginas.getProperty('textContent')).jsonValue();
      title_ = title_.replace(",","");
      const separa  = title_.split("1 a 30 de");
      firstNumber = separa[1];
    }else{
      firstNumber = title_.match(/\d+/)[0];
    }
   
     
     console.log(firstNumber+` -------->  ${workerData.nameWorker} -  ${url}`);     
     await mongo.Detalle_tipotodo_pais.updateOne({ _id: ObjectId(workerData.idtodopais) }, { $set: { todos_to_scrape: firstNumber } });

    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    console.log('ERROR EN MAIN '+workerData.ip_proxy, workerData.url, error);
    process.exit();

  } 

}
/************************************************************/
/************************************************************/
mainWorker();
