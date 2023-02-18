const { Schema, model } = require('mongoose');

const Detalle_todo_lugar = Schema({ 
    id_lugar: { type: Schema.Types.ObjectId, ref: 'Lugar' },
    id_todo: { type: Schema.Types.ObjectId, ref: 'Todo' },
});

module.exports = model('Detalle_todo_lugar', Detalle_todo_lugar);  