const fs = require('fs');
const { Router } = require('express');
const express = require('express');
const request = require('request');
const { MyProxyClass } = require('../helpers/funciones');
const proxyChain = require('proxy-chain');
const router = Router();
const app = express();
const MyProxy = new MyProxyClass();



router.post("/download_image/", async (req, res) => {
    const ip_proxy = await MyProxy.accessResourceProxy();
    const proxyUrl = 'http://prueba:123@'+ip_proxy;
    const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);

    const {url_image} = req.body;
    let options = {
        url: url_image,
        proxy: newProxyUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
        }
    };
    let dest = './downloads/image.jpg';
    request(options).pipe(fs.createWriteStream(dest)).on('close', function(){
        res.send('Imagen descargada');
    });
})

module.exports = router;
