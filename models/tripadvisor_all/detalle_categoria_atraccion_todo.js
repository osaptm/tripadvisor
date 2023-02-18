const { Schema, model } = require('mongoose');

const Detalle_categorias_atraccion_todo = Schema({ 
    id_categoira_atraccion: { type: Schema.Types.ObjectId, ref: 'Categoria_atraccion' },
    id_todo: { type: Schema.Types.ObjectId, ref: 'Todo' },
});

module.exports = model('Detalle_categorias_atraccion_todo', Detalle_categorias_atraccion_todo);  