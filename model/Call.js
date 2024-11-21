const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callSchema = new Schema({
    user_id: {
        type: Schema.user_id,
        required: true
    },
    contact_id: {
        type: Schema.contact_id,
        required: true
    },
    call_date: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    call_type: {
        type: String
    },
    call_flag: {
        type: String
    }
});

module.exports = mongoose.model('Call', callSchema);