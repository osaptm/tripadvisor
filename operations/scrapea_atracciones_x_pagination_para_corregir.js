const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { MyProxyClass} = require('../helpers/funciones');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno
const MyProxy = new MyProxyClass();

const resourceMutex = new mutex();
var temp_array_pages = [];
var workers = 10;
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
        const afectado = await mongo.Pagina.updateOne({ _id: page._id }, { $set: { estado_scrapeo_page: 'INWORKER' } });
        return page;
    } catch (error) {
        console.log(" --- ERROR AL CAMBIAR ESTADO A LA PAGINA A SCRAPEAR");
        return null;
    }
}

async function workerScrapeAtraccionesPage(nameWorker) {
    try {
        
        let proxy = await MyProxy.accessResourceProxy();
        let page = await accessResourcePageIndividual();
        if (page === null) {workers_muertos++;}
    
        const obj_tipotodo_pais = await mongo.Detalle_tipotodo_pais.findOne({ _id: page.idrecurso });
        if (obj_tipotodo_pais === null) { return; }
    
        contador_trabajos++;
        const myWorker = new Worker('./workers/worker_scrape_atracciones_by_page.js',
            {
                workerData: {
                    'contador_trabajos': contador_trabajos,
                    'ip_proxy': proxy,
                    'url': page.url_actual,
                    'idpage': page._id.toString(),
                    'idpais': obj_tipotodo_pais.pais.toString(),
                    'idtipotodo': obj_tipotodo_pais.tipotodo.toString(),
                    'idtipotodo_pais': obj_tipotodo_pais._id.toString(),
                    'nameWorker': nameWorker
                }
            });
    
        myWorker.on('exit', async (code) => {
            workers_muertos++;
            // workerScrapeAtraccionesPage(nameWorker); RECURSIVAMENTE
        });

    } catch (error) {         
        console.log("ERROR workerScrapeAtraccionesPage "+error)
    }

}

// async function actualiza_repetidos_todos_x_idtipotodopais(idrecurso){    
//     let array_detalle_tipotodo_todo = await mongo.Detalle_tipotodo_todo.find({ idtipotodo_pais: ObjectId(idrecurso) });
//     for (const item of array_detalle_tipotodo_todo) {
//         const repetidos = await mongo.Todo_repetido.find({ idtipotodo_pais: ObjectId(idrecurso) });
//         await mongo.Todo.updateOne({ _id: item.id_todo}, {$set : {repetidos: (1 + repetidos.length)} });
//     } 
//     return true;
// }
// await actualiza_repetidos_todos_x_idtipotodopais(idrecurso);
// console.log("ACTUALZIAMOS REPETIDOS "+idrecurso);

const scrapea_atracciones_x_pagination_para_corregir = async () => {
    try {
        await dbConnection();

        const array_idrecursos = [ 
            "63e2cdb0c174005ef434b789","63e2cd7f7c8e10c9e094d612",
            "63e2cdc7b457b07198911c1d","63e2cd1a1c94f0581e0f12fe",
            "63e2cdfe4384b6529dbe455f","63e2cdff4384b6529dbe4563",
            "63e2ce4cd4cf45a7fad1436a"];

        let paginas_acumuladas = [];
        for await (idrecurso of array_idrecursos) {
            let paginas_raspar = await mongo.Pagina.find({ idrecurso: ObjectId(idrecurso), estado_scrapeo_page: { $ne: 'FINALIZADO' } });
            paginas_acumuladas = [...paginas_acumuladas, ...paginas_raspar];
        }

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
    scrapea_atracciones_x_pagination_para_corregir
}
