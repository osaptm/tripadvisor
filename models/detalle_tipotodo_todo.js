const { Schema, model } = require('mongoose');

const Detalle_tipotodo_todo = Schema({ 
    id_tipotodo: { type: Schema.Types.ObjectId, ref: 'Tipotodo' },
    id_todo: { type: Schema.Types.ObjectId, ref: 'Todo' },
    idtipotodo_pais: { type: Schema.Types.ObjectId, ref: 'Detalle_tipotodo_pais' },
    url_padre: {
        type: String,
        required: true,
        default: 'NO_NECESITA',
    }, 
});

module.exports = model('Detalle_tipotodo_todo', Detalle_tipotodo_todo);  