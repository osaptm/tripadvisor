const { Schema, model } = require('mongoose');

const Tipotodo = Schema({
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    }
});

module.exports = model('Tipotodo', Tipotodo);  