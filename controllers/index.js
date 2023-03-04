
const { db_tripadvisor_x_ciudad } = require('../database/config');
const mongo = require('../models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;
const  mongoose = require('mongoose');

const loadIndex = async (req, res)=>{  
    
    await db_tripadvisor_x_ciudad(); 
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
}

module.exports = {
    loadIndex
}