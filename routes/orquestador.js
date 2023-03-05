const fs = require('fs');
const { Router } = require('express');

const { db_tripadvisor_x_ciudad } = require('../database/config');
const mongo = require('../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;
const  mongoose = require('mongoose');

const mutex = require('async-mutex').Mutex;
const resourceMutex = new mutex();

const { MyProxyClass } = require('../helpers/funciones');
const proxyChain = require('proxy-chain');
const router = Router();

const MyProxy = new MyProxyClass();

require('dotenv').config();

const accessResource_receptor_consulta = async (req, res) => {
    const release = await resourceMutex.acquire();
    try {
        console.log("******** Nueva Peticion *********");
        const ip_proxy = await MyProxy.accessResourceProxy();
        const queryFinal = await receptor_consulta(req.body);
        res.send({'pagina': queryFinal, 'proxy': ip_proxy, error: null}); 
    } catch (error) {
        console.log("Error Mutex Orquestador" + error);
        res.send({'pagina': [], 'proxy': null, error : "Error Mutex Orquestador " +error}); 
    } finally {
        release();
    }
};

const receptor_consulta = async ({queryMongo, coleccion}) => {
    try {        
        await db_tripadvisor_x_ciudad();
        const queryFinal =  await eval(queryMongo);

        if(queryFinal.length !== 0 ){
            if(coleccion === 'Atraccion'){
                await mongo.Atraccion.updateOne({ _id: queryFinal[0]._id }, { $set: { estado_scrapeo_comentarios: 'INWORKER' } }); 
            } 
        }
            
        return queryFinal;          
    } catch (error) {
        throw "Error receptor_consulta "+error;
    }
}

router.post("/orquestador/", accessResource_receptor_consulta);

module.exports = router;
