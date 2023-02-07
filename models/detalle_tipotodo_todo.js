const { Schema, model } = require('mongoose');

const Detalle_tipotodo_todo = Schema({ 
    id_tipotodo: { type: Schema.Types.ObjectId, ref: 'Tipotodo' },
    id_todo: { type: Schema.Types.ObjectId, ref: 'Todo' },
});

module.exports = model('Detalle_tipotodo_todo', Detalle_tipotodo_todo);  