const { Schema, model } = require('mongoose');

const Detalle_tipotodo_pais = Schema({  
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
        default:0,
        required: [true, 'Es Obligatorio'],
    }, 
    todos_scrapedoff:{
        type: Number,
        default: 0,
        required: [true, 'Es Obligatorio'] 
    },
    tipotodo: { type: Schema.Types.ObjectId, ref: 'Tipotodo' },
    pais: { type: Schema.Types.ObjectId, ref: 'Pais' },
});

module.exports = model('Detalle_tipotodo_pais', Detalle_tipotodo_pais);  