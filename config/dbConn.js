// db connector
const mongoose = require('mongoose');
const logger = require('../middleware/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (err) {
        logger.error(err);
    }
}

module.exports = connectDB