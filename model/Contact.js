const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
}, {
    toJSON: { virtuals: true } // <-- include virtuals in `JSON.stringify()`
}

);

contactSchema.virtual('fullName').get(function () {
    return this.firstname + ' ' + this.lastname;
});



module.exports = mongoose.model('Contact', contactSchema);