const { Schema, model } = require('mongoose');

const Categorias_atraccion = Schema({  
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },
    url: {
        type: String,
        required: [true, 'Es Obligatorio']
    },   
    estado_scrapeo: {
        type: String,
        required: true,
        default: 'PENDING',
        emun: ['PENDING', 'INWORKER', 'FINALIZADO']
    }, 
    todos_to_scrape:{
        type: Number,
        default: 0,
        required: [true, 'Es Obligatorio'],
    }, 
    todos_scrapedoff:{
        type: Number,
        default: 0,
        required: [true, 'Es Obligatorio'], 
    },
    detalle_tipotodo_pais: { type: Schema.Types.ObjectId, ref: 'Detalle_tipotodo_pais' },
});

module.exports = model('Categorias_atraccion', Categorias_atraccion);  