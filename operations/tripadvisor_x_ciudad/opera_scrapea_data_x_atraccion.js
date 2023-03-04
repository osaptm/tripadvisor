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

async function workerScrapeAtraccionesPage(nameWorker, socket) {
    try {
        
        let proxy = await MyProxy.accessResourceProxy();
        let page = await accessResourcePageIndividual();
        if (page === null) {return;}
    
        contador_trabajos++;
        socket.emit("result_scrapea_info",JSON.stringify( {msj : "INICIAMOS WORKER"} ));      
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
            console.log("FIN WORKER");
            const atraccion = await mongo.Atraccion.findOne({_id: page._id}); 
            socket.emit("result_scrapea_info",JSON.stringify( {msj : "OK", atraccion : atraccion} ));     
        });

    } catch (error) {
        socket.emit("result_scrapea_info",JSON.stringify( {msj : "ERROR AL INICIAR WORKER"} ));         
        console.log("ERROR workerScrapeAtraccionesPage "+error)
    }

}

const opera_scrapea_data_x_atraccion = async (id_atraccion, socket) => {
    try {
        await db_tripadvisor_x_ciudad();
        let paginas_acumuladas = await mongo.Atraccion.find({_id: id_atraccion}); 
                
        if (paginas_acumuladas.length !== 0) {
            temp_array_pages = [...paginas_acumuladas];            
            workerScrapeAtraccionesPage(`WKR`, socket);               
        } else {
            console.log("SIN PAGINAS PARA RASPAR");
            socket.emit("result_scrapea_info",JSON.stringify( {msj : "SIN PAGINAS PARA RASPAR"} )); 
        }

    } catch (error) {
        console.log("ERROR INESPERADO "+error);
        socket.emit("result_scrapea_info",JSON.stringify( {msj : "ERROR INESPERADO EN SERVER"} ));
        return;
    }
};

module.exports = opera_scrapea_data_x_atraccion