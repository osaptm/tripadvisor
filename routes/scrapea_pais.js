const { db_tripadvisor_x_ciudad } = require('../database/config');
const { Router } = require('express');
const express = require('express');
const app = express();
//const { getConsultaIA } = require('../controllers/openia');
const router = Router();

router.get("/scrapea_pais/:paso", async (req, res) => {
    const { paso } = req.params;
    switch (paso) {
        case "paso_1":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_1 = require('../operations/tripadvisor_x_ciudad/paso_1_insertar_ciudades');
                await paso_1();
                app.set('pasos_scrapeo', true);
                res.send("INICIAR paso_1");
            }
            break;
        case "paso_2":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_2 = require('../operations/tripadvisor_x_ciudad/paso_2_generar_paginas_scrapeo');
                await paso_2();
                app.set('pasos_scrapeo', true);
                res.send("INICIAR paso_2");
            }
            break;
        case "paso_3":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_3 = require('../operations/tripadvisor_x_ciudad/paso_3_scrapea_nroatraccions');
                await paso_3();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_3");
            }
            break;
        case "paso_4":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_4 = require('../operations/tripadvisor_x_ciudad/paso_4_generar_paginacion');
                await paso_4();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_4");
            }

            break;
        case "paso_5":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_5 = require('../operations/tripadvisor_x_ciudad/paso_5_scrapea_atracciones_x_pagination');
                await paso_5();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_5");
            }
            break;
        case "paso_6":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_6 = require('../operations/tripadvisor_x_ciudad/paso_6_consulta_catidadprevista_vs_scrapeado');
                await paso_6();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_6");
            }
            res.send("EJECUTANDO paso_6");
            break;
        case "paso_7":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_7 = require('../operations/tripadvisor_x_ciudad/paso_7_scrapea_data_x_atraccion');
                await paso_7();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_7");
            }
            break;
        case "paso_8":
            if (app.get('pasos_scrapeo')) {
                res.send("SE ESTA EJECUTANDO ALGUN PASO SE SCRAPEO -> ESPERAR QUE TERMINE EL PROCESO");
            } else {
                const paso_8 = require('../operations/tripadvisor_x_ciudad/paso_8_scrapear_comentarios');
                await paso_8();
                app.set('pasos_scrapeo', true);
                res.send("EJECUTANDO paso_8");
            }
            break;
        default:
            res.send("NO HAY UN PASO QUE REALIZAR");
            break;
    }
})

module.exports = router;