const mongoose = require('mongoose');
const logger = require('../middleware/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (err) {
        logger.error(err);
    }
}

module.exports = connectDB