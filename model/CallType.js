const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callTypeSchema = new Schema({
    label: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('CallType', callTypeSchema);