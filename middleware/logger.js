require('dotenv').config();
const pino = require('pino');

//levels: fatal, error, warn, info, debug, trace

const logger = pino ({
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    level:  process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
            return {level: label.toUpperCase()}
        }
    }
});

module.exports = logger;