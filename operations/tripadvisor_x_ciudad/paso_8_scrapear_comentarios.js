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
var workers = 1;
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
        await mongo.Atraccion.updateOne({ _id: page._id }, { $set: { estado_scrapeo_comentarios: 'INWORKER' } });
        await mongo.Comentario.deleteMany({id_atraccion: page._id});
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
        if (page === null) {return;}
    
        contador_trabajos++;
        const myWorker = new Worker('./workers/tripadvisor_x_ciudad/_comentarios.js',
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
            workerScrapeAtraccionesPage(nameWorker);
        });

    } catch (error) {         
        console.log("ERROR workerScrapeAtraccionesPage "+error)
    }

}

const paso_9 = async () => {
    try {

        await db_tripadvisor_x_ciudad();

        let paginas_acumuladas = await mongo.Ciudad.aggregate([
            [
                {
                  $match: {
                    id_pais: {
                      $ne: ObjectId("63e1bad8b35402737fe7e9af"), // NO BRASIL
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
                {
                  $lookup: {
                    from: "categoria_atraccion_ciudads",
                    localField: "_id",
                    foreignField: "id_ciudad",
                    as: "catxciu",
                  },
                },
                {
                  $unwind: {
                    path: "$catxciu",
                  },
                },
                {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: ["$$ROOT", "$catxciu"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "atraccion_x_categorias",
                    localField: "_id",
                    foreignField:"id_categoria_atraccion_ciudad",
                    as: "atracciones",
                  },
                },
                {
                  $unwind: {
                    path: "$atracciones",
                  },
                },
                {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: ["$$ROOT", "$atracciones"],
                    },
                  },
                },
                {
                  $project:
                    {
                      _id: "$id_atraccion",
                    },
                },
                {
                  $lookup: {
                    from: "atraccions",
                    localField: "_id",
                    foreignField: "_id",
                    as: "atraccion",
                  },
                },
                {
                  $unwind: {
                    path: "$atraccion",
                  },
                },
                {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: ["$$ROOT", "$atraccion"],
                    },
                  },
                },
                {
                  $match: {
                    estado_scrapeo_comentarios: {
                      $ne: "FINALIZADO",
                    },
                    $expr: {
                      $gt: [
                        {
                          $add: [
                            "$opiniones.Excelente",
                            "$opiniones.Muy_bueno",
                          ],
                        },
                        20,
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    url:1
                  },
                },
              ]
        ]);
       


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

module.exports = paso_9