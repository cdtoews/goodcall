const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callSchema = new Schema({
    contact_id: {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    call_date: {
        type: Date,
        required: true,
        default: Date.now        
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