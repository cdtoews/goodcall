const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    duo_id: {
        type: String
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Editor: Number,
        Admin: Number
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    receive_emails: {
        type: Boolean,
        default: false
    },
    refreshToken: [String]
});

module.exports = mongoose.model('User', userSchema);