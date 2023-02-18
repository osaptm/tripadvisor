const { Schema, model } = require('mongoose');

const Info_atraccion = Schema({ 
    id_blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    id_atraccion: { type: Schema.Types.ObjectId, ref: 'Atraccion' },
});

module.exports = model('Info_atraccion', Info_atraccion);