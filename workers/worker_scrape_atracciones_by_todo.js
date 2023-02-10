const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { workerData } = require('worker_threads');
const { dbConnection, dbSession } = require('../database/config'); // Base de Datoos Mongo
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
    let paginaActualTripasvisor = workerData.pagina_actual;
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
      await page.waitForSelector(".DDJze[data-part='ListSections']", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error en Esperar Al Inicio -> Elemento .DDJze[data-part='ListSections']");
      await page.reload();
      await page.waitForSelector(".DDJze[data-part='ListSections']", { timeout: tiempo_espera });
    }

     /****************************/
     //throw "GENERAMOS UN ERROR PARA PROBAR";
     console.log(`-------->  ${workerData.nameWorker} - NRO ${paginaActualTripasvisor} = ${url}`);
     /****************************/

    // Buscamos si hay una siguiente pagina
    const resultado_buscarSiguientePagina = await buscarSiguientePagina(page, paginaActualTripasvisor, url);
    //paginaSiguiente, enlace,    
    await extraeAtractivos(page); 

    if(resultado_buscarSiguientePagina.enlace === null){
      // Actualizamos el recurso a estado = finalizado 
      await mongo.Detalle_tipotodo_pais.updateOne({ _id: ObjectId(workerData.idrecurso) }, { $set: { estado_scrapeo: 'FINALIZADO' } });
    }
    // Cerrar Pagina - Cerrar Navegador y Terminar Proceso NODEJS
    await page.close();
    await browser.close();
    process.exit();

  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo: 'PENDING' } });
    console.log('ERROR EN MAIN '+workerData.ip_proxy, error);
    process.exit();

  } finally {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo: 'FINALIZADO' } });

  }

}


async function buscarSiguientePagina(page, paginaActualTripasvisor, url) {
  try {
    // Buscamos la paginacion - para recorrer todo
    let tiene_paginacion = false;
    try {
      await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
      tiene_paginacion = true;
    } catch (error) {
      try {
        await page.reload();
        await page.waitForSelector(".jemSU[data-automation='WebPresentation_PaginationLinksList']", { timeout: tiempo_espera });
        tiene_paginacion = true;
      } catch (error) {
        console.log("--------> SIN PAGINACION - POSIBLE ERROR");
        await page.waitForSelector(".jemSU", { timeout: tiempo_espera });
      }
    }
    
    if(tiene_paginacion){

      const divPaginacion = await page.$(".jemSU[data-automation='WebPresentation_PaginationLinksList']");
      const numeracionPaginacion = await divPaginacion.$$(".nsTKv > a");

      for (let elementoEnlace of numeracionPaginacion) {
        const href = await (await elementoEnlace.getProperty('href')).jsonValue();
        const nro_pagina = await (await elementoEnlace.getProperty('textContent')).jsonValue();
        if (Number(nro_pagina) === paginaActualTripasvisor + 1) {    
          
          let obj_pagina = null;
          if(href.trim() !== ""){            
             obj_pagina = await mongo.Pagina.findOne({ url_actual: href });
          }else{
            throw "Error buscarSiguientePagina pagina href vacio";
          }
          
          if(obj_pagina === null){
            //Generar la data a guardar
            const data_ = {
              url_actual: href,
              url_anterior: url,
              numero_actual: Number(nro_pagina),
              numero_anterior: paginaActualTripasvisor,
              idrecurso: ObjectId(workerData.idrecurso)
            }
            const Pagina = new mongo.Pagina(data_);
            const resultadoPagina = await Pagina.save();
            console.log("--------------->"+resultadoPagina);
          }
          return { paginaSiguiente: Number(nro_pagina), enlace: href }; 
        }
      }

    }
    // Return Final  
    return { paginaSiguiente: paginaActualTripasvisor, enlace: null };

  } catch (error) {
    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo: 'PENDING' } });
    console.log('Error en buscarSiguientePagina', error);
    process.exit();

  }
}

async function extraeAtractivos(page) { //idPagina
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
        registroTodo = await mongo.Todo.findOne({ url: hrefAtractivo });
      } else {
        throw "Error hrefAtractivo VACIO";
      }

      if (registroTodo === null) {
        try {
          const data = {
            nombre: nombre_final_sin_numeracion(h3Atractivo),
            url: hrefAtractivo,
            pais: ObjectId(workerData.idpais),
          }

          const document = await mongo.Todo.create([data]);
          const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({
            id_tipotodo: ObjectId(workerData.idtipotodo),
            id_todo: document[0]._id,
            idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)
          });
          const regTodo = await _Detalle_tipotodo_todo.save();
          await mongo.Todo.updateOne({ _id: regTodo._id }, { $inc: { repetidos: 1 } }) 
          console.log(aux + "--------------> [NUEVO AGREGADO]");

        } catch (err) {
          throw "Error guardar TODO y su detalle: " + err;
        }

      } else {
        
        await mongo.Todo.updateOne({ _id: registroTodo._id }, { $inc: { repetidos: 1 } })
        /**************************************************/
        const existe_Detalle_tipotodo_todo = await mongo.Detalle_tipotodo_todo.find({ $and : [
          {id_tipotodo: ObjectId(workerData.idtipotodo)}, 
          {id_todo: registroTodo._id},
          {idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)},
        ]})

        if (existe_Detalle_tipotodo_todo.length === 0) {
            const _Detalle_tipotodo_todo = new mongo.Detalle_tipotodo_todo({
              id_tipotodo: ObjectId(workerData.idtipotodo),
              id_todo: registroTodo._id,
              idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)
            });
            await _Detalle_tipotodo_todo.save();           
        }else{            
            const todo_original = await mongo.Todo.findOne({ _id: registroTodo._id  });
            if(todo_original.repetidos > 2){
                /***************************************************/
                const registroTodo_repetido = await mongo.Todo_repetido.findOne({ idtodo: todo_original._id,  idtipotodo_pais:ObjectId(workerData.idtipotodo_pais) });
                if (registroTodo_repetido === null) {
                  await mongo.Todo_repetido.create([{
                    nombre: nombre_final_sin_numeracion(h3Atractivo),
                    url: hrefAtractivo,
                    url_padre: workerData.url,
                    idtodo:todo_original._id,
                    idtipotodo_pais: ObjectId(workerData.idtipotodo_pais)
                  }]); 
                }
            }      
        }
        /**************************************************/
      }
    }

    console.log(`-------->  ${workerData.nameWorker} = ${workerData.url}`);
    
  } catch (error) {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo: 'PENDING' } });
    console.log('Error en extraeAtractivos', error);
    process.exit();

  } finally {

    await mongo.Pagina.updateOne({ _id: ObjectId(workerData.idpage) }, { $set: { estado_scrapeo: 'FINALIZADO' } });

  }
}
/************************************************************/
/************************************************************/
mainWorker();
