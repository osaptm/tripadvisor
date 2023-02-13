const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { workerData } = require('worker_threads');
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const mongoose = require('mongoose');
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
      args: ['--no-sandbox', '--disable-setuid-sandbox'] //  `--proxy-server=${newProxyUrl}` --> Proxy Sin usar otro paquete npm
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
    let title_ = await (await info.getProperty('textContent')).jsonValue();
    title_ = title_.replaceAll(",", "");
    let firstNumber = 0;
    if (title_.includes("Más de")) {
      const elemento_paginacion = await page.$(".jemSU[data-automation='WebPresentation_PaginationLinksList']")
      const infoPaginas = await elemento_paginacion.$(".uYzlj > .biGQs");
      title_ = await (await infoPaginas.getProperty('textContent')).jsonValue();
      title_ = title_.replaceAll(",", "");
      const separa = title_.split("de");
      firstNumber = Number(separa[2]);
    } else {
      firstNumber = Number(title_.match(/\d+/)[0]);
    }

    await mongo.Detalle_tipotodo_pais.updateOne({ _id: ObjectId(workerData.idtipotodo_pais) }, { $set: { todos_to_scrape: firstNumber } });
    await extraeAtractivos(page);

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'FINALIZADO' } });

    mongoose.connection.close();
    // Cerrar Pagina - Cerrar Navegador y Terminar Proceso NODEJS
    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'PENDING' } });
    console.log('ERROR EN MAIN ' + workerData.ip_proxy, error);
    mongoose.connection.close();
    process.exit();

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

    for await (let element of elements) {

      const secondDiv = await element.$('article > div:nth-of-type(2)');
      const firstH3 = await secondDiv.$('h3');
      const firstA = await secondDiv.$('a:nth-of-type(1)');
      const h3Atractivo = await (await firstH3.getProperty('textContent')).jsonValue();
      const hrefAtractivo = await (await firstA.getProperty('href')).jsonValue();

      let registroTodo = null;
      if (hrefAtractivo.trim() !== "") {

        /***************** TODO AUX SOLO PARA PRUEBAS DE DB ******/
        // await mongo.Todo_auxiliar.create([{
        //   nombre: nombre_final_sin_numeracion(h3Atractivo),
        //   url: hrefAtractivo,
        // }]);
        /***************** TODO AUX SOLO PARA PRUEBAS DE DB ******/

        registroTodo = await mongo.Todo.findOne({ url: hrefAtractivo });

      } else {
        throw "Error hrefAtractivo VACIO";
      }

      if (registroTodo === null) {
        try {

          console.log("---> NUEVO TODO ADGREGADO");
          const data = {
            nombre: nombre_final_sin_numeracion(h3Atractivo),
            url: hrefAtractivo,
            pais: ObjectId(workerData.idpais),
          }
          const document = await mongo.Todo.create([data]);
          const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({
            id_tipotodo: ObjectId(workerData.idtipotodo),
            id_todo: document[0]._id,
            idtipotodo_pais: ObjectId(workerData.idtipotodo_pais),
            url_padre: workerData.url,
          });

          await _Detalle_tipotodo_todo.save();    

        } catch (err) {
          throw "Error guardar TODO y su detalle: " + err;
        }

      } else {
        
        const existe_Detalle_tipotodo_todo = await mongo.Detalle_tipotodo_todo.find({ $and : [
          {id_tipotodo: ObjectId(workerData.idtipotodo)}, 
          {id_todo: registroTodo._id},
          {idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)},
        ]})

        if (existe_Detalle_tipotodo_todo.length === 0) {
            const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({
              id_tipotodo: ObjectId(workerData.idtipotodo),
              id_todo: registroTodo._id,
              idtipotodo_pais: ObjectId(workerData.idtipotodo_pais),
              url_padre: workerData.url,
            });
            await _Detalle_tipotodo_todo.save();           
        }else{            

            if(workerData.url !== existe_Detalle_tipotodo_todo.url_padre){

                const registroTodo_repetido = await mongo.Todo_repetido.findOne({ 
                  idtodo: registroTodo._id, 
                  url_padre:workerData.url,  
                  idtipotodo_pais:ObjectId(workerData.idtipotodo_pais) 
                });
                if (registroTodo_repetido === null) {
                  await mongo.Todo_repetido.create([{
                    nombre: nombre_final_sin_numeracion(h3Atractivo),
                    url: hrefAtractivo,
                    url_padre: workerData.url,
                    idtodo:registroTodo._id,
                    idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)
                  }]); 
                }

            }
    
        }
        /**************************************************/
      }
    }

    console.log(`${workerData?.contador_trabajos} -> ${workerData?.ip_proxy} ${workerData?.nameWorker} / ${elements.length} - ${workerData?.url}`);

  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo_page: 'PENDING' } });
    console.log('Error en extraeAtractivos', error);
    process.exit();

  }
}
/************************************************************/
/************************************************************/
mainWorker();
