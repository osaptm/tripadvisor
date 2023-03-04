const { db_tripadvisor_x_ciudad } = require('./database/config');
const mongo = require('./models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;
const  mongoose = require('mongoose');

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

const cors = require('cors');

const fileUpload = require('express-fileupload');

const { loadIndex } = require('./controllers/index');
//------------- CONFIG Y VARIABLES -------------
require('dotenv').config();
const PORT = process.env.PORT;
app.set('pasos_scrapeo', false); // Variable gobal express - Para ejecutar un prceso al mismo tiempo
io.on('connection', (socket) => { 
  console.log("Socket Connect " + socket.id);  

  socket.on("scrapea_info", async (id_atraccion) => {
    const opera_scrapea_data_x_atraccion = require('./operations/tripadvisor_x_ciudad/opera_scrapea_data_x_atraccion');
    await opera_scrapea_data_x_atraccion(id_atraccion, socket); 
  });

  socket.on("scrapea_reviews", async (id_atraccion) => {
    socket.emit("result_scrapea_reviews",JSON.stringify( {msj : "EN DESARROLLO"} ));  
    //const opera_scrapea_data_x_atraccion = require('./operations/tripadvisor_x_ciudad/opera_scrapear_comentarios');
    //await opera_scrapea_data_x_atraccion(id_atraccion, socket); 
  });

});



//------------- MIDDLEWARES -------------
// CORS
app.use( cors() );
// Lectura y parseo del body
app.use( express.json() );
// Directorio Público
app.use( express.static('public') );
// Fileupload - Carga de archivos
app.use( fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    createParentPath: true
}));
// Motor de plantillas
app.set('view engine', 'ejs');

//------------- RUTAS -------------
app.get("/", loadIndex); // Ruta Index
app.use("/",require("./routes/orquestador"));
app.use("/",require("./routes/backend"));
app.use("/",require("./routes/scrapea_pais"));
app.use("/",require("./routes/download_image"));

//------------- INICIAR SERVER -------------
server.listen(PORT); console.log("Ejecutando en PORT "+PORT)


