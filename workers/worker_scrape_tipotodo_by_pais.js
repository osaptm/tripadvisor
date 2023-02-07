const cheerio = require('cheerio');
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const mongoose = require('mongoose');

const { workerData } = require('worker_threads');
const { ObjectId } = require('mongoose').Types;
require('dotenv').config();
// ********* Para Scrapeo *********** //
const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
// ********* Para Scrapeo *********** //

// ************* Variable requeridas ************* //
const proxyUrl = 'http://prueba:123@' + workerData.ip_proxy;
const tiempo_espera = 30000;
// ************* Variable requeridas ************* //

async function get_pais_pending() {
  const pais = await mongo.Pais.findOne({ estado_scrapeo: "PENDING" });
  return pais;
}

async function get_array_tipotodo(page) {
  try {

    const filter_navbar = await page.$("#filter-navbar");
    const filter_category = await page.$("#filter-category");
    const array_categorias_todo = await filter_navbar.$$(".XDHza > .KoOWI");
    const obj_ = {
      categoria_todo: []
    };
    for await (let element of array_categorias_todo) {
      const title_ = await (await element.getProperty('textContent')).jsonValue();
      const enlace_ = await (await element.getProperty('href')).jsonValue();
      const objCategoria = {
        title: title_,
        enlace: enlace_,
      }
      obj_.categoria_todo.push(objCategoria);
    }
    if (obj_.categoria_todo.length === 0) throw "Error No se encontradon Categorias";
    return obj_;

  } catch (error) {
    throw "Error No se encontradon Categorias Atraccion: " + error;
  }
}

async function get_array_categorias_atraccion(page) {
  try {

    const filter_category = await page.$("#filter-category");
    const array_categorias_ = await filter_category.$$(".XDHza > .KoOWI");
    const obj_ = {
      categoria_atraccion: []
    };
    for await (let element of array_categorias_) {
      const title_ = await (await element.getProperty('textContent')).jsonValue();
      const enlace_ = await (await element.getProperty('href')).jsonValue();
      const objCategoria = {
        title: title_,
        enlace: enlace_,
      }
      obj_.categoria_atraccion.push(objCategoria);
    }
    if (obj_.categoria_atraccion.length === 0) throw "Error No se encontradon Categorias Atraccion";
    return obj_;

  } catch (error) {
    throw "Error No se encontradon Categorias Atraccion: " + error;
  }
}

async function guardar_array_tipotodo(objCategories, obj_pais) {
  try {
    objCategories.categoria_todo.push({title: "Atracciones", enlace: obj_pais.url_tripadvisor});
    const array = objCategories.categoria_todo;
    for await(let element of array) {
      // init for await
      const exsite_tipotodo = await mongo.Tipotodo.findOne({ nombre: element.title });
      if (exsite_tipotodo !== null) {
        const exsite_detalle = await mongo.Detalle_tipotodo_pais.findOne({ tipotodo:exsite_tipotodo._id , pais:obj_pais._id});
        if (exsite_detalle === null) {
          const _detalle_tipotodo_pais = new mongo.Detalle_tipotodo_pais({url: element.enlace, tipotodo:exsite_tipotodo._id, pais:obj_pais._id});
          await _detalle_tipotodo_pais.save();
        } continue;
      }
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Insertamos en Tipotodo y En detalle_tipotodo_pais usamos trycatch para el rollback si hay error
        const _tipotodo = new mongo.Tipotodo({ nombre: element.title });
        const new_tipotodo = await _tipotodo.save({ session });
        const _detalle_tipotodo_pais = new mongo.Detalle_tipotodo_pais({url: element.enlace, tipotodo:new_tipotodo._id, pais:obj_pais._id});
        await _detalle_tipotodo_pais.save({ session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw "Error guardar_array_tipotodo: " +err;
      } finally {
        session.endSession();
      }

    }// fin for await

  } catch (error) {
    throw "Error guardar_array_tipotodo: " + error;
  }
}


async function guardar_array_categorias_atraccion(objCategoriesAtraccion, obj_pais) {
  try {
    let tipotodo_atraccion = null;
    try {      
      tipotodo_atraccion = await mongo.Tipotodo.findOne({ nombre : 'Atracciones' });
      if(tipotodo_atraccion === null){
        const new_tipotodo = new mongo.Tipotodo({ nombre: 'Atracciones'});
        tipotodo_atraccion  = await tipotodo_atraccion.save();
        const _detalle_tipotodo_pais = new mongo.Detalle_tipotodo_pais({url: obj_pais.url_tripadvisor, tipotodo:tipotodo_atraccion._id, pais:obj_pais._id});
        await _detalle_tipotodo_pais.save();
      }
    } catch (error) {
      throw "Error guardar_array_categorias_atraccion - crear TODO Atracciones + Detalle: " + error;
    }

    const Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.findOne({ pais : obj_pais._id, tipotodo: tipotodo_atraccion._id })
    const array = objCategoriesAtraccion.categoria_atraccion;
    
    for await(let element of array) {
      // init for await
      const exsite = await mongo.Categorias_atraccion.findOne({ nombre: element.title });
      if (exsite !== null) continue;

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Insertamos en categorias_atraccion usamos trycatch para el rollback si hay error
        const categorias_atraccion = new mongo.Categorias_atraccion({nombre:element.title, url: element.enlace, detalle_tipotodo_pais:Obj_Detalle_tipotodo_pais._id});
        await categorias_atraccion.save({ session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw "Error guardar_array_categorias_atraccion: " +err;
      } finally {
        session.endSession();
      }

    }// fin for await

  } catch (error) {
    throw "Error guardar_array_categorias_atraccion: " + error;
  }
}

// ****************************************** MAIN  ******************************************** //
(async () => {
  try {
    await dbConnection();
    const pais = await get_pais_pending();
    if (pais === null) {console.log("---> NO TENEMOS PAIS PENDIENTE"); process.exit();}

    const url = pais.url_tripadvisor;

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

    try {
      await page.waitForSelector(".pqlZe", { timeout: tiempo_espera });
      await page.waitForSelector(".JfoTr", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error Elemento .pqlZe o .JfoTr");
      await page.reload();
      await page.waitForSelector(".pqlZe", { timeout: tiempo_espera });
      await page.waitForSelector(".JfoTr", { timeout: tiempo_espera });
    }

    const array_tipotodo = await get_array_tipotodo(page);
    await guardar_array_tipotodo(array_tipotodo, pais);

    const array_categorias_atraccion = await get_array_categorias_atraccion(page);
    await guardar_array_categorias_atraccion(array_categorias_atraccion, pais);

    await mongo.Pais.updateOne({_id:pais._id} , {$set: {estado_scrapeo: 'FINALIZADO'}});

    process.exit();
  } catch (error) {
    console.log("Error en Worker ", error)
    process.exit();
  }
 
})();
// ****************************************** MAIN  ******************************************** //