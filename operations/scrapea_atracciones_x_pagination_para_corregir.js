const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { MyProxyClass, accessResourceProxy } = require('../helpers/funciones');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const MyProxy = new MyProxyClass();
const mutexProxy = new mutex();
const resourceMutex = new mutex();
var temp_array_pages = [];
var workers = 1;


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
    let proxy = await accessResourceProxy(mutexProxy, MyProxy);
    let page = await accessResourcePageIndividual();
    if (page === null) { return; }

    const obj_tipotodo_pais = await mongo.Detalle_tipotodo_pais.findOne({ _id: page.idrecurso });
    if (obj_tipotodo_pais === null) { return; }

    const myWorker = new Worker('./workers/worker_scrape_atracciones_by_page.js',
        {
            workerData: {
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
        //console.log("---> (EXIT WORKER) = " + page.url_actual);
        myWorker.terminate();
        setTimeout(() => workerScrapeAtraccionesPage(nameWorker), Math.floor((Math.random() * 1000)));
    });

}

async function actualiza_repetidos_todos_x_idtipotodopais(idrecurso){    
    let array_detalle_tipotodo_todo = await mongo.Detalle_tipotodo_todo.find({ idtipotodo_pais: ObjectId(idrecurso) });
    for (const item of array_detalle_tipotodo_todo) {
        const repetidos = await mongo.Todo_repetido.find({ idtipotodo_pais: ObjectId(idrecurso) });
        await mongo.Todo.updateOne({ _id: item.id_todo}, {$set : {repetidos: (1 + repetidos.length)} });
    } 
    return true;
}

const scrapea_atracciones_x_pagination_para_corregir = async () => {

    await dbConnection();

    const array_idrecursos = ["63e2cc5bd907c58050596c62", "63e2cc5bd907c58050596c66", "63e2ccf921469f0797359959", "63e2ccfa21469f079735995d", "63e2ccfd21469f0797359975", "63e2cd151c94f0581e0f12d6", "63e2cd161c94f0581e0f12da", "63e2cd161c94f0581e0f12de", "63e2cd171c94f0581e0f12e2", "63e2cd7b7c8e10c9e094d5ee", "63e2cd7b7c8e10c9e094d5f2", "63e2cd7c7c8e10c9e094d5f6", "63e2cd7f7c8e10c9e094d612", "63e2cd925a859147e4aebdba", "63e2cdacc174005ef434b765", "63e2cdadc174005ef434b76d", "63e2cdadc174005ef434b771", "63e2cdb0c174005ef434b789", "63e2cdc3b457b07198911c01", "63e2cdc4b457b07198911c05", "63e2cdc4b457b07198911c09", "63e2cdc5b457b07198911c11", "63e2cdc7b457b07198911c19", "63e2cdc7b457b07198911c1d", "63e2cde4c0a97a66d4960181", "63e2cdfb4384b6529dbe4547", "63e2cdfc4384b6529dbe454b", "63e2cdfc4384b6529dbe454f", "63e2cdfd4384b6529dbe4553", "63e2cdfe4384b6529dbe455f", "63e2cdff4384b6529dbe4563", "63e2ce47d4cf45a7fad14346", "63e2ce48d4cf45a7fad1434a", "63e2ce48d4cf45a7fad1434e", "63e2ce4cd4cf45a7fad1436a"];
    
    let idrecurso = array_idrecursos[0];

    
    await mongo.Detalle_tipotodo_todo.deleteMany({ idtipotodo_pais: ObjectId(idrecurso) });   
    console.log("ELIMINAMOS DETALLE")
    await actualiza_repetidos_todos_x_idtipotodopais(idrecurso);
    console.log("ACTUALZIAMOS REPETIDOS")
    await mongo.Pagina.updateMany({ idrecurso: ObjectId(idrecurso)}, {$set : {estado_scrapeo_page: 'PENDING'} });
    console.log("CAMBIAMOS PAGINAS A PENDIENTE")
    let paginas_raspar_pending = await mongo.Pagina.find({ idrecurso: ObjectId(idrecurso), estado_scrapeo_page: 'PENDING' });
    let paginas_raspar_worker = await mongo.Pagina.find({ idrecurso: ObjectId(idrecurso), estado_scrapeo_page: 'INWORKER' });

    if (paginas_raspar_pending.length !== 0 || paginas_raspar_worker.length !== 0) {
        temp_array_pages = [...paginas_raspar_pending, ...paginas_raspar_worker];
        for (let index = 0; index < workers; index++) {
            workerScrapeAtraccionesPage(`( WKR - ${index + 1} )`);
        }
    } else {
        console.log("SIN PAGINAS PARA RASPAR");
    }

};

module.exports = {
    scrapea_atracciones_x_pagination_para_corregir
}
