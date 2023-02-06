const { Schema, model } = require('mongoose');

const Lugar = Schema({
    nombre: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    url: {
        type: String,
    },
    idpais: { type: Schema.Types.ObjectId, ref:'Pais' },
    idlugar: { type: Schema.Types.ObjectId },
});

module.exports = model('Lugar', Lugar);  