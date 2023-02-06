const { exec } = require('child_process');
// child_process - exec apra ejecutar comandos shell en windows
const { Worker, workerData } = require('worker_threads');
// Por lo general, se recomienda no crear más de un Worker Thread por núcleo de procesador para evitar el sobrecargar el sistema.
// Saber nucleos -> comando "lscpu" en Linux o el comando "wmic cpu get NumberOfCores" en Windows.
// Los workers creados con worker_threads en Node.js ejecutan su código en un hilo separado de ejecución, 
// lo que significa que sus tareas se ejecutan independientemente del hilo principal. 
// Esto permite a la aplicación realizar varias tareas simultáneamente, aumentando significativamente su rendimiento.
// worker_threads para trabajar en sub procesos en otro hilo y no bloquear la aplicacion
// Worker = Para crear un nuevo Trabajador, workerData = Para tener data disponible en todos los workers

const mutex = require('async-mutex').Mutex;
const semaphore = require('async-mutex').Semaphore;
// async-mutex sirve para controlar la concurrencia y accesos a recursos, con semaforos ys tiempos de espera predefinidos

const cheerio = require('cheerio'); // Para trabajas con etiquetas html
const { dbConnection } = require('./database/config'); // Base de Datoos Mongo
const mongo = require('./models');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const resourceMutex = new mutex(); // Create a mutex to control access to the resource 
// Create a semaphore to control the number of concurrent accesses
const concurrencySemaphore = new semaphore(1); // Max 1 concurrent accesses

const resourceMutex2 = new mutex();
const concurrencySemaphore2 = new semaphore(1);

const resourceMutex3 = new mutex();
const concurrencySemaphore3 = new semaphore(1);


// // Create a function to access the resource
// const accessResource = async () => {
//     // Wait for the semaphore
//     await concurrencySemaphore.acquire();
//     // Wait for the mutex
//     const release = await resourceMutex.acquire();
//     try {
//         trae_datos_array_y_borralos();
//     } catch (error) {
//         console.log("Error Mutex");
//     } finally {
//         release(); // Release the mutex
//         concurrencySemaphore.release(); // Release the semaphore
//     }
// };

// function initUpdate() {
//     const worker = new Worker('./worker_update_atractivos.js', { workerData });
//     worker.on('exit', (code) => {
//         console.log("Fin worker")
//     });
// }


// for (let index = 0; index < array_numeros.length; index++) {

//     accessResource();
//     // trae_datos_array_y_borralos();

// }

/*function initScrape(){
    const worker = new Worker('./worker.js', { workerData });
    worker.on('exit', (code) => {
        console.log("Fin worker")
        exec('taskkill /F /IM chrome.exe', (error, stdout, stderr) => {if (error)  return; });
        setTimeout(() => {
            initScrape()
        }, 5000);
    });
}
initScrape();*/




// 1. Utilizar índices para optimizar las consultas. Los índices mejoran el tiempo de respuesta de las consultas en Mongoose al proporcionar una forma más rápida de acceder a los documentos.

// 2. Usar consultas más específicas. Cuanto más específicas sean las consultas, menor será el tiempo de respuesta.

// 3. Utilizar proyecciones para limitar el número de campos devueltos. Esto puede ayudar a reducir el tiempo de respuesta al evitar que Mongoose tenga que recuperar y devolver todos los campos de los documentos.

// 4. Utilizar consultas de límite para limitar el número de documentos que se recuperan. Esto reduce el tiempo necesario para recuperar los documentos.

// 5. Utilizar consultas de agregación para procesar datos en lugar de realizar acciones en cada documento individualmente. Esto mejorará el tiempo de respuesta al reducir la cantidad de trabajo que debe realizar Mongoose para devolver los resultados.

// También es importante tener en cuenta el tamaño de los índices. Si se crean índices demasiado grandes, esto puede reducir la velocidad de escritura y también aumentar el consumo de memoria. Por lo tanto, es importante encontrar el equilibrio adecuado entre la velocidad de lectura y la velocidad de escritura.

// Además, también es importante actualizar los índices cada vez que se realicen cambios en la base de datos. Esto garantizará que los índices se mantengan actualizados para reflejar los cambios en la base de datos. Esto también mejorará la velocidad de lectura.

// En resumen, para asegurarse de que Mongoose funcione correctamente con una colección que contenga millones de documentos, es importante crear índices adecuados para las consultas frecuentes, mantenerlos actualizados y encontrar el equilibrio adecuado entre la velocidad de lectura y escritura.

//Crear Indice
// const index = await Modelo.createIndex({ campo1: 1, campo2: 1 });

// //Actualizar Indice
// const index = await Model.updateIndex({ campo1: 1, campo2: 1 });

// //Eliminar Indice
// const index = await Model.dropIndex('nombre_del_indice');

// //Crear Indice Compuesto
// const index = await Model.createIndex({ campo1: 1, campo2: 1, campo3: -1 });

// //Crear Indice Único
// const index = await Model.createIndex({ campo1: 1 }, { unique: true });

// //Crear Indice de Texto
// const index = await Model.createIndex({ campo1: 'text' });

// //Crear Indice Espacial
// const index = await Model.createIndex({ campo1: '2dsphere' });




// const accessResource = async (atractivo) => {
//     // Wait for the semaphore
//     await concurrencySemaphore.acquire();
//     // Wait for the mutex
//     const release = await resourceMutex.acquire();
//     try {
//         return await oneAtractivo();
//     } catch (error) {
//         console.log("Error Mutex");
//     } finally {
//         resourceMutex.release(); // Release the mutex
//         concurrencySemaphore.release(); // Release the semaphore
//     }
// };

const accessResourceProxy = async () => {
    // Wait for the semaphore
    await concurrencySemaphore2.acquire();
    // Wait for the mutex
    const release = await resourceMutex2.acquire();
    try {
        return oneProxy();
    } catch (error) {
        console.log("Error Mutex accessResourceProxy "+error);
    } finally {
        resourceMutex2.release(); // Release the mutex
        concurrencySemaphore2.release(); // Release the semaphore
    }
};


const accessResourcePage = async () => {
    await concurrencySemaphore3.acquire();
    const release = await resourceMutex3.acquire();
    try {
        return await onePageToScrape();
    } catch (error) {
        console.log("Error Mutex accessResourcePage "+error);
    } finally {
        resourceMutex3.release(); // Release the mutex
        concurrencySemaphore3.release(); // Release the semaphore
    }
};

async function workerScrapePage() {
    let proxy = await accessResourceProxy();
    let page = await accessResourcePage();
    if (page === null) { return; }
    const myWorker = new Worker('./workers/worker_scrape_atracciones_by_todo.js',
     { workerData: { 'ip_proxy': proxy, 'url': page.url_actual, 'pagina_actual': page.numero_actual, 'idrecurso':page.idrecurso.toString(), 'idpais':page.idpais.toString(), 'idtipotodo':page.idtipotodo.toString()} });
    console.log("---> Inicio Worker "+page.idrecurso.toString());
    myWorker.on('exit', async (code) => {
        console.log("---> Fin Worker = " + page.url_actual);
        myWorker.terminate();
        workerScrapePage(page.idrecurso);
    });
}

// async function trae_atractivo_random() {
//     const atractivo = await mongo.modeloAtractivo.aggregate([
//         { $match: { estado: 'PENDIENTE' } },
//         { $sample: { size: 1 } }
//     ]);
//     await mongo.modeloAtractivo.updateOne({ _id: atractivo[0]._id }, { $set: { estado: 'INWORKER' } });
//     atractivo[0]['_id'] = atractivo[0]['_id'].toString();
//     return atractivo;
// }


const array_proxy = ['196.196.220.155', '196.196.247.237', '5.157.55.218', '185.104.217.42', "165.231.95.148", "45.95.118.28", "165.231.95.17", "196.196.34.44", "185.158.104.152", "165.231.95.118", "50.3.198.225", "185.158.104.33", "185.158.106.179", "196.196.34.72", "185.158.106.153", "185.158.104.161", "5.157.55.128", "196.196.220.229", "196.196.34.180", "50.3.198.89", "50.3.198.30", "45.95.118.191", "196.196.34.84", "50.3.198.193"];
var temp_array_proxy = [...array_proxy];
var temp_array_pages = [];

var array_atractivos = [];
var skip = 0;
var limit = 1;
var workers = 1;
var contador = 0;


function oneProxy() {
    if (temp_array_proxy.length === 0) { temp_array_proxy = [...array_proxy]; }
    let position = Math.floor(Math.random() * (temp_array_proxy.length - 1));
    let proxy = temp_array_proxy[position];
    temp_array_proxy.splice(position, 1);
    return proxy;
}

async function onePageToScrape() {
    if (temp_array_pages.length === 0) {
        const array_todos = await array_todos_pendientes_scrapeo();
        if (array_todos === null) { console.log("No hay TODOs pendientes de scrapear"); return null; }
        const array_pages = await array_paginas_pendientes_scrapeo(array_todos);
        if (array_pages.length === 0) { console.log("---> NO HAY PAGINAS PARA SCRAPEAR"); return null; }
        temp_array_pages = [...array_pages];
    }
    let position = Math.floor(Math.random() * (temp_array_pages.length - 1));
    let page = temp_array_pages[position];
    temp_array_pages.splice(position, 1);
    return page;
}

// async function oneAtractivo() {
//     if (array_atractivos === null) return null;
//     if (array_atractivos.length === 0) { skip += limit; await get_array_atractivos(skip); }
//     const position = Math.floor(Math.random() * (array_atractivos.length - 1));
//     let element = array_atractivos[position]._doc;
//     array_atractivos.splice(position, 1);
//     element._id = element['_id'].toString();
//     const proxy = await accessResourceProxy();
//     contador++; // contar numero total de atractivos recorridos
//     return { 'atractivo': element, 'ip_proxy': proxy };
// }

// async function get_array_atractivos(skip) {
//     console.clear(); console.log(contador);
//     array_atractivos = await mongo.modeloAtractivo.find({}, { "_id": 1, "url": 1 }).skip(skip).limit(limit);
// }

async function array_paginas_pendientes_scrapeo(array_todos_pendientes) {
    try {
        const array_paginas = [];
        for (const todo of array_todos_pendientes) {
            let ultima_pagina = await mongo.Pagina.findOne({ idrecurso: todo._id }).sort({ _id: -1 });
            if (ultima_pagina === null) {
                const _pagina = new mongo.Pagina({ url_actual: todo.url, idrecurso:todo._id });
                ultima_pagina = await _pagina.save();
            }
            ultima_pagina['idrecurso'] = todo._id;
            ultima_pagina['idpais'] = todo.pais;
            ultima_pagina['idtipotodo'] = todo.tipotodo;
            array_paginas.push(ultima_pagina);
        }
        return array_paginas;
    } catch (err) {
        throw "Error array_paginas_pendientes_scrapeo: " + err;
    }
}


async function array_todos_pendientes_scrapeo() {
    // BUSCAR UN TODO CON ESTADO INWORKER -> SI NO EXISTE - TOMAMOS AL PRIMERO CON ESTADO PENDING
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'INWORKER' });
        if (Obj_Detalle_tipotodo_pais.length === 0) {
            Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'PENDING' });
            if (Obj_Detalle_tipotodo_pais.length === 0) { session.endSession(); return null; }
            await mongo.Detalle_tipotodo_pais.updateMany({ estado_scrapeo: 'PENDING' }, { $set: { estado_scrapeo: 'INWORKER' } }, { session });
        }
        await session.commitTransaction();
        Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'INWORKER' });
        return Obj_Detalle_tipotodo_pais;
    } catch (err) {
        await session.abortTransaction();
        throw "Error array_todos_pendientes_scrapeo: " + err;
    } finally {
        session.endSession();
    }
}

(async () => {

    await dbConnection();
    let proxy = await accessResourceProxy();
    const worker = new Worker('./workers/worker_scrape_tipotodo_by_pais.js', { workerData: { 'ip_proxy': proxy } });
    worker.on('exit', async (code) => {
        console.log("---> FIN WORKER QUE TRAE LOS PRIMEROS ENLACES");

        const array_todos = await array_todos_pendientes_scrapeo();
        if (array_todos === null) { console.log("No hay TODOs pendientes de scrapear"); return; }
        const array_paginas = await array_paginas_pendientes_scrapeo(array_todos);
        if (array_paginas.length === 0) { console.log("No hay PAGINAS pendientes de scrapear"); return; }
        temp_array_pages = [...array_paginas];
        for (let index = 0; index < workers; index++) {            
            workerScrapePage();
        }
        worker.terminate();
    });


})();




// (async () => {
//     // await mongo.modeloAtractivo.updateMany({$set: {estado: 'PENDIENTE'}});
//     // await mongo.modeloPagina.updateMany({}, {$unset: {html: 1, error:1}}, {multi: true});
//     // await mongo.modeloAtractivo.updateMany({}, {$unset: {nombre: 1, html_inicial:1}}, {multi: true});
//     process.exit();
// })();