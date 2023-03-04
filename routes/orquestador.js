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

const accessResource_receptor_consulta = async (req, res) => {
    const release = await resourceMutex.acquire();
    try {
        return receptor_consulta(req, res);
    } catch (error) {
        console.log("Error Mutex Orquestador" + error);
    } finally {
        release();
    }
};

const receptor_consulta = async (req, res) => {
    await db_tripadvisor_x_ciudad();
    const ip_proxy = await MyProxy.accessResourceProxy();
    const {queryMongo, coleccion} = req.body;
    const queryFinal =  await eval(queryMongo);

    if(coleccion === 'Atraccion'){
        await mongo.Atraccion.updateOne({ _id: queryFinal[0]._id }, { $set: { estado_scrapeo_comentarios: 'INWORKER' } }); 
    }
    
    res.send({'pagina': queryFinal, 'proxy': ip_proxy}); 
}

router.post("/orquestador/", accessResource_receptor_consulta);

module.exports = router;
