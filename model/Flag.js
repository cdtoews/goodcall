const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flagSchema = new Schema({
    label: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Flag', flagSchema);