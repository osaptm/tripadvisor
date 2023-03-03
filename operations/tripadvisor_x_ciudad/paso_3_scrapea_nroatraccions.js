const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { db_tripadvisor_x_ciudad } = require('../../database/config'); // Base de Datoos Mongo
const mongo = require('../../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno
const { MyProxyClass } = require('../../helpers/funciones');
const resourceMutex = new mutex();
const mutexProxy = new mutex();
const MyProxy = new MyProxyClass();

var array_detalle = [];
var workers = 7;
var contador_trabajos = 0;

const accessResourceTodoPais = async () => {
    // Wait for the mutex
    const release = await resourceMutex.acquire();
    try {
        return one_detalle();
    } catch (error) {
        console.log("Error Mutex accessResourceProxy " + error);
    } finally {
        release(); // Release the mutex  
    }
};


function one_detalle() {
    if (array_detalle.length === 0) { return null; }
    let position = Math.floor(Math.random() * (array_detalle.length - 1));
    let todo_pais = array_detalle[position];
    array_detalle.splice(position, 1);
    return todo_pais;
}

async function worker_nro_atracciones(nameWorker) {
    let proxy = await MyProxy.accessResourceProxy();
    let obj_detalle = await accessResourceTodoPais();
    if (obj_detalle === null) { return; }
    contador_trabajos++;
    await mongo.Categoria_atraccion_ciudad.updateOne({ _id: obj_detalle._id }, { $set: { estado_scrapeo_nro: 'INWORKER' } });    
    const myWorker = new Worker('./workers/tripadvisor_x_ciudad/worker_scrape_nro_atracciones.js',
        {
            workerData: {
                'contador_trabajos': contador_trabajos,
                'ip_proxy': proxy,
                'url': obj_detalle.url,
                'iddetalle': obj_detalle._id.toString(),
                'nameWorker': nameWorker
            }
        });
    myWorker.on('exit', async (code) => {
        myWorker.terminate();
        setTimeout(() => worker_nro_atracciones(nameWorker), Math.floor((Math.random() * 1000)));
    });
}


async function paso_3 (){

    await db_tripadvisor_x_ciudad();
    const consulta = await mongo.Categoria_atraccion_ciudad.find({
        $or: [
            {estado_scrapeo_nro: 'PENDING'},
            {estado_scrapeo_nro: 'IN_WORKER'}, 
            {estado_scrapeo_nro: 'INWORKER'}, 
            {estado_scrapeo_nro: 'CON_ERRORES'},
        ]
    }); 
    if(consulta.length!==0){
        console.log(consulta.length);
        array_detalle = [...consulta];
        for (let index = 0; index < workers; index++) {
            worker_nro_atracciones(`( WKR - ${index + 1} )`);
        }
    }else{
        console.log(consulta.length);
    }  

};

module.exports = paso_3