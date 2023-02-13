const { Schema, model } = require('mongoose');

const Todo_auxiliar = Schema({
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    url: {
        type: String,
        required: [true, 'Es Obligatorio']
    } 
});

module.exports = model('Todo_auxiliar', Todo_auxiliar);  