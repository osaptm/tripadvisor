const { Worker, workerData } = require('worker_threads');
const mutex = require('async-mutex').Mutex;
const { dbConnection } = require('../database/config'); // Base de Datoos Mongo
const mongo = require('../models');
const { ObjectId } = require('mongoose').Types; // Para usar ObjectId y comprar
require('dotenv').config(); // Variables de entorno
const { MyProxyClass, accessResourceProxy } = require('../helpers/funciones');
const resourceMutex = new mutex();
const mutexProxy = new mutex();
const MyProxy = new MyProxyClass();

var array_todos_pais = [];
var workers = 1;

const accessResourceTodoPais = async () => {
    // Wait for the mutex
    const release = await resourceMutex.acquire();
    try {
        return oneTodoPais();
    } catch (error) {
        console.log("Error Mutex accessResourceProxy " + error);
    } finally {
        release(); // Release the mutex  
    }
};


function oneTodoPais() {
    if (array_todos_pais.length === 0) { return null; }
    let position = Math.floor(Math.random() * (array_todos_pais.length - 1));
    let todo_pais = array_todos_pais[position];
    array_todos_pais.splice(position, 1);
    return todo_pais;
}

async function workerScrapeNroTodos(nameWorker) {
    let proxy = await accessResourceProxy(mutexProxy, MyProxy);
    let todoPais = await accessResourceTodoPais();
    if (todoPais === null) { return; }
    const myWorker = new Worker('../workers/worker_scrape_nro_todos.js',
        {
            workerData: {
                'ip_proxy': proxy,
                'url': todoPais.url,
                'idtodopais': todoPais._id.toString(),
                'nameWorker': nameWorker
            }
        });
    //console.log("---> (NEW WORKER) ");
    myWorker.on('exit', async (code) => {
        //console.log("---> (EXIT WORKER) = " + page.url_actual);
        myWorker.terminate();
        setTimeout(() => workerScrapeNroTodos(nameWorker), Math.floor((Math.random() * 1000)));
    });
}


(async () => {

    await dbConnection();
    const consulta = await mongo.Detalle_tipotodo_pais.find({}); 
    if(consulta.length!==0){
        console.log(consulta.length);
        array_todos_pais = [...consulta];
        for (let index = 0; index < workers; index++) {
            workerScrapeNroTodos(`( WKR - ${index + 1} )`);
        }
    }else{
        console.log(consulta.length);
    }  

})();

