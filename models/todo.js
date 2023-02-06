const { Schema, model } = require('mongoose');

const Todo = Schema({
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
        emun: ['PENDING', 'FINALIZADO']
    }, 
    pais: { type: Schema.Types.ObjectId, required: true, ref:'Pais'},
    obj_tipotodo: { type: Object, required: true,  default: {}},
    obj_categorias_atraccion: { type: Object, required: true,  default: {}},
});

module.exports = model('Todo', Todo);  