const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { db_tripadvisor_x_ciudad } = require('../../database/config'); // Base de Datoos Mongo
const mongo = require('../../models/tripadvisor_x_ciudad');
const { MyProxyClass } = require('../../helpers/funciones');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const MyProxy = new MyProxyClass();
const resourceMutex = new mutex();
var temp_array_pages = [];
var workers = 10;
var contador_trabajos = 0;

const accessResourcePageIndividual = async () => {
    const release = await resourceMutex.acquire();
    try {
        return await onePageIndividual();
    } catch (error) {
        console.log("Error Mutex accessResourcePageIndividual " + error);
    } finally {
        release();
    }
};

async function onePageIndividual() {
    if (temp_array_pages.length === 0) return null;
    setTimeout(() => true, Math.floor((Math.random() * 1000)));
    let position = Math.floor(Math.random() * (temp_array_pages.length - 1));
    let page = temp_array_pages[position];
    temp_array_pages.splice(position, 1);

    try {
        await mongo.Atraccion.updateOne({ _id: page._id }, { $set: { estado_scrapeo: 'INWORKER' } });
        return page;
    } catch (error) {
        console.log(" --- ERROR onePageIndividual AL CAMBIAR ESTADO A LA PAGINA A SCRAPEAR");
        return null;
    }
}

async function workerScrapeAtraccionesPage(nameWorker) {
    try {
        
        let proxy = await MyProxy.accessResourceProxy();
        let page = await accessResourcePageIndividual();
        if (page === null) {return;}
    
        contador_trabajos++;
        const myWorker = new Worker('./workers/tripadvisor_x_ciudad/_atractivos.js',
            {
                workerData: {
                    'contador_trabajos': contador_trabajos,
                    'ip_proxy': proxy,
                    'url': page.url,
                    'idatraccion': page._id.toString(),                   
                    'nameWorker': nameWorker
                }
            });
    
        myWorker.on('exit', async (code) => {
            workerScrapeAtraccionesPage(nameWorker);
        });

    } catch (error) {         
        console.log("ERROR workerScrapeAtraccionesPage "+error)
    }

}

const paso_7 = async () => {
    try {

        await db_tripadvisor_x_ciudad();

        let paginas_acumuladas = await mongo.Atraccion.find({estado_scrapeo: { $ne: 'FINALIZADO' }});
          
        console.log("TOTAL DE PAGINAS = " + paginas_acumuladas.length);

        if (paginas_acumuladas.length !== 0) {
            temp_array_pages = [...paginas_acumuladas];
            for (let index = 0; index < workers; index++) {
                setTimeout(() => {
                    workerScrapeAtraccionesPage(`( WKR - ${index + 1} )`);
                }, index*1000);
            }
        } else {
            console.log("SIN PAGINAS PARA RASPAR");
        }

    } catch (error) {
        console.log("ERROR INESPERADO "+error);
        process.exit();
    }

};

module.exports = paso_7