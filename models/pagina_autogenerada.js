const { Schema, model } = require('mongoose');

const Pagina_autogenerada= Schema({
    url_actual: {
        type: String,
        required: [true, 'Es Obligatorio']
    },    
    numero_actual: {
        type: Number,
        default: 1,
        required: [true, 'Es Obligatorio']
    }, 
    estado_scrapeo_page: {
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

module.exports = model('Pagina_autogenerada', Pagina_autogenerada);  