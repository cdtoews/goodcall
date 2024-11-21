const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const branchSchema = new Schema({
    label: {
        type: String,
        required: true
    },
    company_id: {
        type: Schema.company_id,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Call', branchSchema);