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
        const afectado = await mongo.Pagina_autogenerada.updateOne({ _id: page._id }, { $set: { estado_scrapeo_page: 'INWORKER' } });
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
        const myWorker = new Worker('./workers/worker_scrape_atracciones_by_page_autogenerada.js',
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

const scrapea_atracciones_x_pagination_autogenerada = async () => {
    try {
        await dbConnection();

        const array_idrecursos = ["63e2cc58d907c58050596c4a",
            "63e2cc5cd907c58050596c6e",
            "63e2ccfe21469f079735997d",
            "63e2cdc8b457b07198911c25",
            "63e2ce004384b6529dbe456b"];

        let paginas_acumuladas = [];
        for await (idrecurso of array_idrecursos) {
            let paginas_raspar = await mongo.Pagina_autogenerada.find({ idrecurso: ObjectId(idrecurso), estado_scrapeo_page: { $ne: 'FINALIZADO' } });
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

            // exec("sync; echo 1 > /proc/sys/vm/drop_caches", (err, stdout, stderr) => {
            //     if (err) {
            //         console.error(`exec error: ${err}`);
            //         return;
            //     }
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            // });

            exec('echo %temp%', (err, stdout, stderr) => {
                if(err) {
                    console.log(`Error: ${err}`);
                    return;
                }
            
                console.log(`Output is: ${stdout}`);
            
                exec(`del /q /s ${stdout}`, (err, stdout, stderr) => {
                    if(err) {
                        console.log(`Error: ${err}`);
                        return;
                    }
            
                    console.log(`Memoria liberada!`);
                });
            });


            process.exit();
           }
        }, 2000);

    } catch (error) {
        console.log("ERROR INESPERADO "+error);
        process.exit();
    }

};

module.exports = {
    scrapea_atracciones_x_pagination_autogenerada
}
