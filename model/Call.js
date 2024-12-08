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
        type: String,
        required: true
    },
    call_flag: {
        type: String,
        required: true
    }
}, {
    toJSON: { virtuals: true } // <-- include virtuals in `JSON.stringify()`
});

callSchema.virtual("friendly_date").get(function () {
    const thisDate = this.call_date;
    const date = new Date(thisDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 to month (0-indexed)
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
})

callSchema.virtual("friendly_time").get(function () {
    const thisDate = this.call_date;
    const date = new Date(thisDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
})

callSchema.virtual("employeeName").get(function () {
    var str = this.user_id.username;
    var nameParts = str.split("@");
    var name = nameParts.length==2 ? nameParts[0] : "";
    return name;
})


module.exports = mongoose.model('Call', callSchema);