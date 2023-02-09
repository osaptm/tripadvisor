const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { workerData } = require('worker_threads');
const { dbConnection, dbSession } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config();

// Variable requeridas
const proxyUrl = 'http://prueba:123@' + workerData.ip_proxy;
const tiempo_espera = 30000;

function nombre_final_sin_numeracion(nombre) {
  const nombre_final_array = nombre.split('. ');
  const eliminar_primero = nombre_final_array.shift();
  const nombre_final = nombre_final_array.join('');
  return nombre_final;
}

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
    await page.goto(url, { waitUntil: 'load' });
    // Esoeramos por el selector unos 5 segundos    
    try {
      await page.waitForSelector(".jemSU", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar Al Inicio -> Elemento .jemSU");
      await page.reload();
      await page.waitForSelector(".jemSU", { timeout: tiempo_espera });
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
     
    await mongo.Detalle_tipotodo_pais.updateOne({ _id: ObjectId(workerData.idtipotodo_pais) }, { $set: { todos_to_scrape: firstNumber } });
    await extraeAtractivos(page);

    // Cerrar Pagina - Cerrar Navegador y Terminar Proceso NODEJS
    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'PENDING' } });
    console.log('ERROR EN MAIN ' + workerData.ip_proxy, error);
    process.exit();

  } finally {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'FINALIZADO' } });

  }

}



async function extraeAtractivos(page) {
  try {

    try {
      await page.waitForSelector(".jemSU", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar extraeAtractivos -> Elemento .jemSU");
      await page.reload();
      await page.waitForSelector(".jemSU", { timeout: tiempo_espera });
    }

    // Buscamos todos los elementos que coincidan
    const elements = await page.$$(".jemSU[data-automation='WebPresentation_SingleFlexCardSection']");
    // Recorrer todo el arreglo
    let aux = 0; let nuevos = 0; let detalles = 0;
    for await (let element of elements) { aux++;
      //const article = await element.$('article');
      //const html_article = await (await article.getProperty('innerHTML')).jsonValue();
      const secondDiv = await element.$('article > div:nth-of-type(2)');
      const firstH3 = await secondDiv.$('h3');
      const firstA = await secondDiv.$('a:nth-of-type(1)');
      const h3Atractivo = await (await firstH3.getProperty('textContent')).jsonValue();
      const hrefAtractivo = await (await firstA.getProperty('href')).jsonValue();
      
      var obj_todo = null;
      if (hrefAtractivo.trim() !== "") {

        const data1 = {
          nombre: nombre_final_sin_numeracion(h3Atractivo),
          url: hrefAtractivo,
          pais: ObjectId(workerData.idpais),
        }

        const document1 = await mongo.Todo_prueba.create([data1]); 

        obj_todo = await mongo.Todo.findOne({ url: hrefAtractivo });
        //console.log(">>>>> EXISTE "+obj_todo._id);
      } else {
        throw "Error hrefAtractivo VACIO";
      }

      if (obj_todo === null) {
        nuevos++;
        try {
          const data = {
            nombre: nombre_final_sin_numeracion(h3Atractivo),
            url: hrefAtractivo,
            pais: ObjectId(workerData.idpais),
          }

          const document = await mongo.Todo.create([data]); 
          const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({ id_tipotodo: ObjectId(workerData.idtipotodo), id_todo: document[0]._id, idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)});
          const registro = await _Detalle_tipotodo_todo.save();

        } catch (err) {
          throw "Error guardar TODO y su detalle: " + err;
        } 

      } else {
        let existe_Detalle_tipotodo_todo = await mongo.Detalle_tipotodo_todo.findOne({ id_tipotodo: ObjectId(workerData.idtipotodo), id_todo: obj_todo._id,  idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)});              
        if (existe_Detalle_tipotodo_todo === null) {  
          detalles ++;       
          const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({ id_tipotodo: ObjectId(workerData.idtipotodo), id_todo: obj_todo._id, idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)});
          const registro = await _Detalle_tipotodo_todo.save();
          //console.log(aux + "--------------> [DETALLE AGREGADO]"+ registro);
        }

      }
    }
    console.log(aux +' - '+ nuevos +' - '+ detalles +' - '+  `-------->  ${workerData.nameWorker} = ${workerData.url}`);

  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'PENDING' } });
    console.log('Error en extraeAtractivos', error);
    process.exit();

  } finally {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'FINALIZADO' } });

  }
}
/************************************************************/
/************************************************************/
mainWorker();
