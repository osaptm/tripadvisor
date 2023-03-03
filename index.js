const { db_tripadvisor_x_ciudad } = require('./database/config');
const mongo = require('./models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const  mongoose = require('mongoose');
//------------- CONFIG Y VARIABLES -------------
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;
app.set('pasos_scrapeo', false); // Variable gobal express - Para ejecutar un prceso al mismo tiempo

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
app.get("/", async (req, res)=>{   
    await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB

    // const session = await mongoose.startSession(); // Creamos una session para Transactions
    // session.startTransaction(); // Iniciamos una Transaction
    // await mongo.Blog.create([{nombre: 'Blog 1'},{nombre: 'Blog 2'}], { session: session }); // Usamos CREATE con la opcion de la session 
    // await session.commitTransaction(); // Ejecutamos la transaccion anterior que esta en la session
    // await session.endSession(); // Cerramos la Transaccion

    //const blogs = await mongo.Blog.find({});
    const blogs =  await mongo.Blog.aggregate([
      {          
        $lookup: {
          from: "pais_blogs",
          localField: "_id",
          foreignField: "id_blog",
          as: "paises_blog" ,   
        },           
      },
      {
        $lookup: {
          from: "pais",
          localField: "paises_blog.id_pais",
          foreignField: "_id",
          as: "pais"
        }         
      }
    ]);

    res.render('index',{ blogs });
   
});
app.use("/",require("./routes/backend"));
app.use("/",require("./routes/scrapea_pais"));
app.use("/",require("./routes/download_image"));

//------------- INICIAR SERVER -------------
app.listen(PORT);
console.log("Ejecutando en PORT "+PORT)


