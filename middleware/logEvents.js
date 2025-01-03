require('dotenv').config();
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (err) {
        console.error(err);
    }
}

const getUsername = (req) => {
    try {
        if (!req?.headers?.authorization) {
            //console.debug("no auth header");
            return "";
        }
        const thisToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(thisToken, process.env.ACCESS_TOKEN_SECRET);
        return decoded.UserInfo.username
    } catch (err) {
        console.error(err);
        return "";
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    let userInfo = "";
    if(req.method !== "OPTIONS"){
        const username = getUsername(req);
        userInfo = ` , user:${username}`;
    }
    const username = getUsername(req);
    console.log(`method:${req.method} , path:${req.path} , ${userInfo} , remote_ip:${req.ip} , params:${JSON.stringify(req.params)} , query:${JSON.stringify(req.query)} , env:${process.env.MY_ENV}`);
    next();
}

module.exports = { logger, logEvents };
