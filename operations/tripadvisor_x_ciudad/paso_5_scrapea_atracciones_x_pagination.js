const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { db_tripadvisor_x_ciudad } = require('../../database/config'); // Base de Datoos Mongo
const mongo = require('../../models/tripadvisor_x_ciudad');
const { MyProxyClass} = require('../../helpers/funciones');
const { exec } = require('child_process');
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
        await mongo.Pagina.updateOne({ _id: page._id }, { $set: { estado_scrapeo_page: 'INWORKER' } });
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
        if (page === null) { return;}
    
        const Categoria_atraccion_ciudad = await mongo.Categoria_atraccion_ciudad.findOne({ _id: page.id_categoria_atraccion_ciudad });
        if (Categoria_atraccion_ciudad === null) { return; }
    
        contador_trabajos++;
        const myWorker = new Worker('./workers/tripadvisor_x_ciudad/worker_scrape_atracciones_by_page.js',
            {
                workerData: {
                    'contador_trabajos': contador_trabajos,
                    'ip_proxy': proxy,
                    'url': page.url_actual,
                    'idpage': page._id.toString(),                    
                    'numero_atracciones': Categoria_atraccion_ciudad.numero_atracciones,
                    'id_ciudad': Categoria_atraccion_ciudad.id_ciudad.toString(),
                    'id_categoria_atraccion': Categoria_atraccion_ciudad.id_categoira_atraccion.toString(),
                    'idrecurso': Categoria_atraccion_ciudad._id.toString(),
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


const paso_5 = async () => {
    try {
        await db_tripadvisor_x_ciudad();       

        let paginas_acumuladas = [];       
        let paginas_raspar = await mongo.Pagina.find({ estado_scrapeo_page: { $ne: 'FINALIZADO' } });
        paginas_acumuladas = [...paginas_raspar];        

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

module.exports = paso_5
