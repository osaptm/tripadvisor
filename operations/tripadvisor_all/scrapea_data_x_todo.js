const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { MyProxyClass} = require('../helpers/funciones');
const { exec } = require('child_process');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno
const MyProxy = new MyProxyClass();

const resourceMutex = new mutex();
var temp_array_pages = [];
var workers = 1;
var contador_trabajos = 0;
var workers_muertos = 0;


const accessResourcePageIndividual = async () => {
    const release = await resourceMutex.acquire();
    try {
        return await onePageIndividual();
    } catch (error) {
        console.log("Error Mutex accessResourcePageIndividual " + error);
    } finally {
        release(); // Release the mutex
    }
};

async function onePageIndividual() {
    if (temp_array_pages.length === 0) return null;
    setTimeout(() => true, Math.floor((Math.random() * 1000)));
    let position = Math.floor(Math.random() * (temp_array_pages.length - 1));
    let page = temp_array_pages[position];
    temp_array_pages.splice(position, 1);

    try {
        //const afectado = await mongo.Pagina_autogenerada.updateOne({ _id: page._id }, { $set: { estado_scrapeo_page: 'INWORKER' } });
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
        if (page === null) {workers_muertos++;}
    
        contador_trabajos++;
        const myWorker = new Worker('./workers/_atractivos.js',
            {
                workerData: {
                    'contador_trabajos': contador_trabajos,
                    'ip_proxy': proxy,
                    'url': page.url,                   
                    'nameWorker': nameWorker
                }
            });
    
        myWorker.on('exit', async (code) => {
            workers_muertos++;
            // workerScrapeAtraccionesPage(nameWorker);
        });

    } catch (error) {         
        console.log("ERROR workerScrapeAtraccionesPage "+error)
    }

}

const scrapea_data_x_todo = async () => {
    try {
        await dbConnection();

        let paginas_acumuladas = await mongo.Todo.find({estado_scrapeo_page: { $ne: 'FINALIZADO' }}).skip(0).limit(1);
          
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

        setInterval(() => {
           if(workers_muertos === workers) {
            console.log("FINALIZAR EL PROGRAMA");
            process.exit();
           }
        }, 2000);

    } catch (error) {
        console.log("ERROR INESPERADO "+error);
        process.exit();
    }

};

module.exports = {
    scrapea_data_x_todo
}
