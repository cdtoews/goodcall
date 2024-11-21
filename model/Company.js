const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    label: {
        type: String,
        required: true
    },
    active: {
        type: Boolean
    }
});

module.exports = mongoose.model('Call', companySchema);