const { Schema, model } = require('mongoose');

const Pagina = Schema({
    url_actual: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    url_anterior: {
        type: String,
        default:'No tiene pagina anterior',
        required: [true, 'Es Obligatorio']
    },    
    numero_actual: {
        type: Number,
        default: 1,
        required: [true, 'Es Obligatorio']
    },   
    numero_anterior: {
        type: Number,
        default:0,
        required: [true, 'Es Obligatorio']
    }, 
    total_todos: {
        type: Number,
        required: [true, 'Es Obligatorio'],
        default:0
    }, 
    estado_scrapeo: {
        type: String,
        required: true,
        default: 'PENDING',
        emun: ['PENDING', 'INWORKER', 'FINALIZADO']
    }, 
    idrecurso: { 
        type: Schema.Types.ObjectId ,
        required: [true, 'Es Obligatorio'],
    },
});

module.exports = model('Pagina', Pagina);  