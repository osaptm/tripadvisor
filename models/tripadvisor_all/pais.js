const { Schema, model } = require('mongoose');

const Pais = Schema({
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    url_tripadvisor: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    estado_scrapeo: {
        type: String,
        required: true,
        default: 'PENDING',
        emun: ['PENDING', 'FINALIZADO']
    }, 
    categorias_to_scrape:{
        type: Number,
        required: [true, 'Es Obligatorio'],
    }, 
    todos_to_scrape:{
        type: Number,
        required: [true, 'Es Obligatorio'],
    }, 
    todos_scrapedoff:{
        type: Number,
        required: [true, 'Es Obligatorio'],
        default: 0
    }
});

module.exports = model('Pais', Pais);  