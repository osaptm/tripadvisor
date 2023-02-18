const { Schema, model } = require('mongoose');

const Todo_repetido = Schema({
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    url: {
        type: String,
        required: [true, 'Es Obligatorio']
    },     
    url_padre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },
    idtodo: { type: Schema.Types.ObjectId, ref: 'Todo' , required: [true, 'Es Obligatorio']},
    idtipotodo_pais: { type: Schema.Types.ObjectId, ref: 'Detalle_tipotodo_pais' , required: [true, 'Es Obligatorio']},
});

module.exports = model('Todo_repetido', Todo_repetido);  