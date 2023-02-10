const { exec } = require('child_process');
const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { MyProxyClass, accessResourceProxy } = require('../helpers/funciones');
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno

const mutexProxy = new mutex();
const MyProxy = new MyProxyClass();
const resourceMutex = new mutex();
var temp_array_pages = [];
var workers = 1;


const accessResourcePage = async () => {
    const release = await resourceMutex.acquire();
    try {
        return await onePageToScrape();
    } catch (error) {
        console.log("Error Mutex accessResourcePage " + error);
    } finally {
        release(); // Release the mutex
    }
};

async function onePageToScrape() {
    if (temp_array_pages.length === 0) {
        temp_array_pages = [];
        const array_todos = await array_todos_pendientes_scrapeo();
        if (array_todos === null) { console.log(" -- NO HAY TODOS PENDIENTES"); return null; }
        const array_pages = await array_paginas_pendientes_scrapeo(array_todos);
        if (array_pages.length === 0) { console.log(" --- NO HAY PAGINAS PARA SCRAPEAR"); return null; }
        temp_array_pages = [...array_pages];
    }

    setTimeout(() => true, Math.floor((Math.random() * 5000)));

    let position = Math.floor(Math.random() * (temp_array_pages.length - 1));
    let page = temp_array_pages[position];
    temp_array_pages.splice(position, 1);

    try {
        const afectado = await mongo.Pagina.updateOne({ _id: page._id }, { $set: { estado_scrapeo: 'INWORKER' } });
        return page;
    } catch (error) {
        console.log(" --- ERROR AL CAMBIAR ESTADO A LA PAGINA A SCRAPEAR");
        return null;
    }
}


async function array_paginas_pendientes_scrapeo(array_todos_pendientes) {
    try {
        const array_paginas = [];
        for (const todo of array_todos_pendientes) { // array_todos_pendientes
            let ultima_pagina = await mongo.Pagina.findOne({ idrecurso: todo._id, estado_scrapeo: 'INWORKER' }).sort({ _id: -1 });
            if (ultima_pagina === null) {
                ultima_pagina = await mongo.Pagina.findOne({ idrecurso: todo._id, estado_scrapeo: 'PENDING' }).sort({ _id: -1 });
                if (ultima_pagina === null) {
                    ultima_pagina = await mongo.Pagina.findOne({ idrecurso: todo._id, estado_scrapeo: 'FINALIZADO' }).sort({ _id: -1 });
                    if (ultima_pagina === null) {
                        const _pagina = new mongo.Pagina({ url_actual: todo.url, idrecurso: todo._id });
                        ultima_pagina = await _pagina.save();
                    }
                    continue; // No tomamos en cuenta porque ya esta finalizado
                }
            } else {
                const paginas_borradas = await mongo.Pagina.deleteMany({ idrecurso: todo._id, url_anterior: ultima_pagina.url_actual });
                console.log("--------- PAGINAS BORRADAS : " + paginas_borradas.deletedCount)
            }

            ultima_pagina['idrecurso'] = todo._id;
            ultima_pagina['idpais'] = todo.pais;
            ultima_pagina['idtipotodo'] = todo.tipotodo;
            ultima_pagina['idtipotodo_pais'] = todo._id;
            array_paginas.push(ultima_pagina);
        }

        return array_paginas;
    } catch (err) {
        throw "Error array_paginas_pendientes_scrapeo: " + err;
    }
}


async function array_todos_pendientes_scrapeo() {
    try {
        let Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'PENDING' });
        if (Obj_Detalle_tipotodo_pais.length !== 0) {
            await mongo.Detalle_tipotodo_pais.updateMany({ estado_scrapeo: 'PENDING' }, { $set: { estado_scrapeo: 'INWORKER' } });
        } else {
            Obj_Detalle_tipotodo_pais = await mongo.Detalle_tipotodo_pais.find({ estado_scrapeo: 'INWORKER' });
            if (Obj_Detalle_tipotodo_pais.length === 0) {
                return null;
            }
        }
        return Obj_Detalle_tipotodo_pais;
    } catch (err) {
        throw "Error array_todos_pendientes_scrapeo: " + err;
    }
}

async function workerScrapePage(nameWorker) {
    let proxy = await accessResourceProxy(mutexProxy, MyProxy);
    let page = await accessResourcePage();
    if (page === null) { return; }
    const myWorker = new Worker('./workers/worker_scrape_atracciones_by_todo.js',
        {
            workerData: {
                'ip_proxy': proxy,
                'url': page.url_actual,
                'pagina_actual': page.numero_actual,
                'idrecurso': page.idrecurso.toString(),
                'idpais': page.idpais.toString(),
                'idtipotodo': page.idtipotodo.toString(),
                'idpage': page._id.toString(),
                'idtipotodo_pais': page.idtipotodo_pais.toString(),
                'nameWorker': nameWorker
            }
        });
    //console.log("---> (NEW WORKER) ");
    myWorker.on('exit', async (code) => {
        //console.log("---> (EXIT WORKER) = " + page.url_actual);
        myWorker.terminate();
        setTimeout(() => workerScrapePage(nameWorker), Math.floor((Math.random() * 1000)));
    });
}


(async () => {
    await dbConnection();
    let proxy = await accessResourceProxy();
    const worker = new Worker('../workers/worker_scrape_tipotodo_by_pais.js', { workerData: { 'ip_proxy': proxy } });
    worker.on('exit', async (code) => {
        console.log("---> FIN WORKER QUE TRAE LOS PRIMEROS ENLACES");
        const array_todos = await array_todos_pendientes_scrapeo();
        if (array_todos === null) { console.log("No hay TODOs pendientes de scrapear"); return; }
        const array_paginas = await array_paginas_pendientes_scrapeo(array_todos);
        if (array_paginas.length === 0) { console.log("No hay PAGINAS pendientes de scrapear"); return; }
        temp_array_pages = [...array_paginas];
        for (let index = 0; index < workers; index++) {
            setTimeout(() => workerScrapePage(`( WKR - ${index + 1} )`), Math.floor((Math.random() * 10000)));
        }
        worker.terminate();
    });
})();

