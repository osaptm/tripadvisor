const cheerio = require('cheerio');
const mongo = require('../database/database');
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

function nombre_final_sin_numeracion(nombre) {
  const nombre_final_array = nombre.split('. ');
  const eliminar_primero = nombre_final_array.shift();
  const nombre_final = nombre_final_array.join('');
  return nombre_final;
}

async function get_breadcrumbs(page , url_actual){
  const breadcrumbs = await page.$$("div[data-automation='breadcrumbs'] > div");
    const obj_breadcrumbs = {
      breadcrumbs : []
    };

    for await (let element of breadcrumbs) {
       const title_breadcrumbs =  await(await element.getProperty('textContent')).jsonValue();
       const enlace = await element.$('a:nth-of-type(1)');
       const enlace_breadcrumbs =  enlace !== null ? await (await enlace.getProperty('href')).jsonValue() : url_actual;
       const objBreadcrumbs =  {
          title : title_breadcrumbs,
          enlace : enlace_breadcrumbs,
        }
        obj_breadcrumbs.breadcrumbs.push(objBreadcrumbs);
    }

    return obj_breadcrumbs;
}

async function get_h1_page(page){
  const h1_page = await page.$("h1");
  return await(await h1_page.getProperty('textContent')).jsonValue();
}

// ****************************************** MAIN  ******************************************** //
(async () => {
  try {
    const url = workerData.atractivo.url;
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
    const title_page = await page.title();
    
    //Esoeramos por el selector unos N segundos -> si no aparece recargamos la pagina una vez
    try {
      await page.waitForSelector(".PZxoo", { timeout: tiempo_espera });
    } catch (error) {
      console.log("Error Elemento .PZxoo");
      await page.reload();
      await page.waitForSelector(".PZxoo", { timeout: tiempo_espera });
    }
    
    console.log(await get_breadcrumbs(page, url));
    console.log(await get_h1_page);

    // const seccion_categorias_reviews = await page.$("section div[data-automation='WebPresentation_PoiOverviewWeb']");
    // const categorias_reviews = await seccion_categorias_reviews.$$(".kUaIL");
    // console.log(categorias_reviews)
    // const obj_categorias_reviews = {
    //   datos : []
    // };

    // for await (let element of categorias_reviews) {
    //    const title_ =  await (await element.getProperty('textContent')).jsonValue();
    //    const html_ =   await (await element.getProperty('innerHTML')).jsonValue();
    //    const obj_categorias =  {
    //       title : title_,
    //       html : html_,
    //     }
    //     obj_categorias_reviews.datos.push(obj_categorias);
    // }
    // console.log(obj_categorias_reviews);

    // https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/4a/8c/f5/machu-picchu.jpg?w=1100&h=-1&s=1
    // https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/4a/8c/f5/machu-picchu.jpg?w=100&h=-1&s=1

    process.exit();
  } catch (error) {
    console.log("Error en Worker ", error)
    process.exit();
  }
  // await mongo.modeloAtractivo.updateOne({_id:atractivo._id} , {$set: {nombre_final: nombre_final}});
})();
// ****************************************** MAIN  ******************************************** //