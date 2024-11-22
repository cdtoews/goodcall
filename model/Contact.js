const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    notes: {
        type: String
    },
    branch_id: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Contact', contactSchema);