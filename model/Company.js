const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    label: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});
 
module.exports = mongoose.model('Company', companySchema);