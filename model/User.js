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
   
        // "Admin": 5150,
        // "Editor": 1984,
        // "User": 2001
    
    password: {
        type: String,
        required: true
    },
    pw_reset_timeout: {
        type: Date
    },
    temp_password: {
        type: String
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
}, {
    toJSON: { virtuals: true } // <-- include virtuals in `JSON.stringify()`
});

userSchema.virtual("admin").get(function () {
    if(this?.roles?.Admin == 5150){
        return true;
    }else{
        return false;
    }

})

userSchema.virtual("short_username").get(function () {
    try {
        var str = this.username;
        var nameParts = str.split("@");
        var name = nameParts.length === 2 ? nameParts[0] : "";
        return name;
      } catch (err) {
        console.log(err);
        return "";
      }

})

module.exports = mongoose.model('User', userSchema);