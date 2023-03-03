const { db_tripadvisor_x_ciudad } = require('../database/config');
const mongo = require('../models/tripadvisor_x_ciudad');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const { Router } = require('express');
const express = require('express');
const app = express();
const router = Router();

function query_paisXblog(id_pais){
    let match = [];
    if(id_pais !== null){
        match.push({
            $match: {
                _id: ObjectId(id_pais),
            }
        });
    }
    return [...match,
        {
            $lookup: {
                from: "pais_blogs",
                localField: "_id",
                foreignField: "id_pais",
                as: "paisBlogs",
            },
        },
        {
            $lookup:{
            from: 'ciudads',
            localField: '_id',
            foreignField: 'id_pais',
            as: 'ciudades'
          }
        },
        {
            $project: {
              _id: 1,
              nombre: 1,
              total_ciudades: {
                $size: "$ciudades",
              },
              paisBlogs:1
            },
          },
    ]
}
function query_ciudadXpaisXblog(id_blog, id_pais){
    return [
        {
          $match: {
            id_pais: ObjectId(
             id_pais
            ),
          },
        },
        {
          $lookup: {
            from: "categoria_atraccion_ciudads",
            localField: "_id",
            foreignField: "id_ciudad",
            as: "yyy",
            pipeline: [
              {
                $lookup: {
                  from: "atraccion_x_categorias",
                  localField: "_id",
                  foreignField:
                    "id_categoria_atraccion_ciudad",
                  as: "xxx",
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$yyy",
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              nombre: "$nombre",
            },
            total_atracciones: {
              $sum: {
                $size: "$yyy.xxx",
              },
            },
          },
        },
        {
          $lookup: {
            from: "atraccion_blogs",
            localField: "_id._id",
            foreignField: "id_ciudad",
            as: "publicado",
            pipeline: [
              {
                $match: {
                  id_blog: ObjectId(
                    id_blog
                  ),
                },
              },
            ],
          },
        },
        {
            $project: {
              _id: "$_id._id",
              nombre: "$_id.nombre",
              total_atracciones: 1,
              publicado: {
                $size: "$publicado",
              }
            },
          },
          {
            $sort: {
                total_atracciones: -1,
                publicado: -1,
              },
          },
      ]
}
router.post("/back/paises_blog/", async (req, res) => {
    const { id_blog, id_pais } = req.body;

    await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB
    let ciudades = [];
    if (id_pais === null) {
        try {
            const paises = await mongo.Pais.aggregate(query_paisXblog(id_pais));
            res.status(200).json({ paises, ciudades, id_blog });
        } catch (error) {
            res.status(400).json({ error });
        }
        return;
    }

    try {

        const session = await mongoose.startSession(); // Creamos una session para Transactions
        session.startTransaction(); // Iniciamos una Transaction  

        const paises = await mongo.Pais.aggregate( query_paisXblog(id_pais), { session: session });

        ciudades = await mongo.Ciudad.aggregate( query_ciudadXpaisXblog(id_blog, id_pais), { session: session });

        await session.commitTransaction(); // Ejecutamos la transaccion anterior que esta en la session
        await session.endSession(); // Cerramos la Transaccion

        res.status(200).json({
            paises,
            ciudades,
            id_blog
        });

    } catch (error) {
        res.status(400).json({ error });
    }

})

router.post("/back/ciudades_blog", async (req, res) => {
    const { id_blog, id_pais } = req.body;
    await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB  
    const ciudades = await mongo.Ciudad.aggregate(query_ciudadXpaisXblog(id_blog, id_pais));
    res.status(200).json({ ciudades, id_blog, id_pais });
})

router.post("/back/categorias", async (req, res) => {
    const { id_blog, id_ciudad } = req.body;
    await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB  
    const categorias = await mongo.Categoria_atraccion_ciudad.aggregate([
        {
          $match: {
            id_ciudad: ObjectId(
                id_ciudad
            ),
          },
        },
        {
          $lookup: {
            from: "categorias_atraccions",
            localField: "id_categoira_atraccion",
            foreignField: "_id",
            as: "categoria",
          },
        },
        {
          $lookup: {
            from: "atraccion_x_categorias",
            localField: "_id",
            foreignField:
              "id_categoria_atraccion_ciudad",
            as: "atraccionesXcategoria",
            pipeline: [
              {
                $lookup: {
                  from: "atraccion_blogs",
                  localField: "id_atraccion",
                  foreignField: "id_atraccion",
                  as: "atraccionBlog",
                  pipeline: [
                    {
                      $match: {
                        id_blog: ObjectId(
                            id_blog
                        ),
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  publicado: {
                    $size: ["$atraccionBlog"],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$categoria",
          },
        },
        {
          $project: {
            _id: "$categoria._id",
            nombre: "$categoria.nombre",
            total_atracciones: {
              $size: ["$atraccionesXcategoria"],
            },
            publicado: {
              $sum: "$atraccionesXcategoria.publicado",
            },
          },
        },
      ]);
    res.status(200).json({ categorias, id_blog, id_ciudad });
})

router.post("/back/atracciones_blog", async (req, res) => {
    const { id_blog, id_ciudad, id_categoria, pagina, registros_x_pagina } = req.body;
    await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB  
    const atracciones = await mongo.Categoria_atraccion_ciudad.aggregate([
        {
          $match: {
            id_categoira_atraccion: ObjectId(id_categoria),
            id_ciudad: ObjectId(id_ciudad),
          },
        },
        {
          $lookup: {
            from: "atraccion_x_categorias",
            localField: "_id",
            foreignField:
              "id_categoria_atraccion_ciudad",
            as: "atraccionesXcategoria",
          },
        },
        {
          $unwind: {
            path: "$atraccionesXcategoria",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$$ROOT",
                "$atraccionesXcategoria",
              ],
            },
          },
        },
        {
          $lookup: {
            from: "atraccion_blogs",
            localField: "id_atraccion",
            foreignField: "id_atraccion",
            as: "atraccionBlog",
            pipeline: [
              {
                $match: {
                  id_blog: ObjectId(
                    id_blog
                  ),
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "atraccions",
            localField: "id_atraccion",
            foreignField: "_id",
            as: "data_atraccion",
          },
        },
        {
          $unwind: {
            path: "$data_atraccion",
          },
        },
        {
          $project: {
            publicado: {
              $size: ["$atraccionBlog"],
            },
            data_atraccion: 1,
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$$ROOT",
                "$data_atraccion",
              ],
            },
          },
        },
        {
            $lookup: {
              from: "comentarios",
              localField: "_id",
              foreignField: "id_atraccion",
              as: "comentarios",
            },
          },
          {
            $addFields:
              {
                cantidad_comentarios: {
                  $size: ["$comentarios"],
                },
              },
          },
          {
            $project: {
              data_atraccion: 0,
              estado_scrapeo_comentarios: 0,
              estado_scrapeo: 0,
              __v: 0,
              cantidad_scrapeado: 0,
              comentarios: 0,
            },
          },
        {
          $sort:{
            cantidad_comentarios:-1,
          }
        }
      ]).skip(pagina*registros_x_pagina).limit(registros_x_pagina);

    res.status(200).json({ atracciones, id_blog, id_ciudad, id_categoria });
})

router.post("/back/comentarios", async (req, res) => {
  const { id_atraccion, pagina, registros_x_pagina } = req.body;
  await db_tripadvisor_x_ciudad(); // Conectamos a Mongo DB  
  const comentarios = await mongo.Comentario.aggregate([
      {
        $match: {
          id_atraccion: ObjectId(id_atraccion),
        },
      },
    ]).skip(pagina*registros_x_pagina).limit(registros_x_pagina);

  res.status(200).json(comentarios);
})
module.exports = router;