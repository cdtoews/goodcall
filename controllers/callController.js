require('dotenv').config();
const logger = require('../middleware/logger');
const Call = require('../model/Call');
const User = require('../model/User');
const Contact = require('../model/Contact');
const ROLES_LIST = require('../config/roles_list');
const boolVerifyRoles = require('../middleware/boolVerifyRoles');
const { th } = require('date-fns/locale');
const sendEmail = require('../middleware/sendEmail');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { getUserObject } = require('./usersController');

// async function getUserObject(req) {
//     //we have req.user, which is the username
//     const thisUser = await User.findOne({ username: req.user }).lean().exec();
//     //return Promise.resolve(thisUser);
//     return thisUser;
// }

async function parseQuery(req) {

    var result = {};
    //check if gt is there
    if (req.query.gt) {
        var gtlt = {};
        gtlt.$gt = new Date(req.query.gt);
        if (req.query.lt) gtlt.$lt = new Date(req.query.lt);
        result.call_date = gtlt;
        return result;
        //   call_date: { $gt: gtDate, $lt: new Date('2024-11-27') }
    } else {
        const daysBack = req.query.daysback ? req.query.daysback : process.env.CALL_SEARCH_DEFAULT_DAYS_BACK;
        let ltDate = new Date();
        ltDate.setDate(ltDate.getDate() - daysBack);
        result.call_date = { $gt: ltDate }
        return result;
    }
}

async function parseQueryOnlyMine(req) {
    var result = await parseQuery(req);
    // const thisUser = await getUserObject(req);
    const thisUser = await getUserObject(req);
    result.user_id = thisUser._id;
    return result;
}

//#region New Call
const createNewCall = async (req, res) => {
    var msg = 'started';
    try {
        logger.trace("createNewCall");
        //we have req.user, which is the username
        const thisUser = await getUserObject(req, res);

        if (!req?.body?.contact_id ||
            !req?.body?.call_type) {
            return res.status(400).json({ 'message': 'Required fields: contact_id,  call_type ' });
        }
        msg = 'made it to 59';
        const newCall = new Call();
        newCall.user_id = thisUser._id;
        newCall.contact_id = req.body.contact_id;
        newCall.notes = req.body.notes;
        newCall.call_type = req.body.call_type;
        newCall.call_flag = req.body.call_flag;
        if (req.body?.call_date) newCall.call_date = req.body.call_date;
        msg = 'made it to 67';
        const result = newCall.save();
        msg = 'made it to 69';
        logger.debug('new call created');
        res.status(201).json(newCall);
        sendEmail.sendCallEntryEmail(req);
    } catch (err) {
        logger.error(err, "createNewCall");
        return res.status(400).json({ 'message': msg });
    }
}


//#region Update
// const updateCall = async (req, res) => {
//     if (!req?.body?.id) {
//         return res.status(400).json({ 'message': 'ID parameter is required.' });
//     }

//     const call = await Call.findOne({ _id: req.body.id }).exec();
//     if (!call) {
//         return res.status(204).json({ "message": `No call matches ID ${req.body.id}.` });
//     }
//     if (req.body?.contact_id) call.contact_id = req.body.contact_id;
//     if (req.body?.user_id) call.user_id = req.body.user_id;
//     if (req.body?.call_date) call.call_date = req.body.call_date;
//     if (req.body?.notes) call.notes = req.body.notes;
//     if (req.body?.call_type) call.call_type = req.body.call_type;
//     if (req.body?.call_flag) call.call_flag = req.body.call_flag;
//     const result = await call.save();
//     res.json(result);
// }

// const deleteCall = async (req, res) => {
//     if (!req?.body?.id) return res.status(400).json({ 'message': 'call ID required.' });
//     const call = await Call.findOne({ _id: req.body.id }).exec();
//     if (!call) {
//         return res.status(204).json({ "message": `No call matches ID ${req.body.id}.` });
//     }
//     const result = await call.deleteOne({ _id: req.body.id });
//     res.json(result);
// }



//#region MyCalls
const getMyCalls = async (req, res) => {
    try {
        logger.trace("getMyCalls");
        const searchParams = await parseQueryOnlyMine(req);
        // console.log(searchParams);
        //console.log("get my calls");
        //console.log(searchParams);
        const calls = await Call.find(searchParams)
            .sort({ call_date: -1 })
            .populate([{
                path: 'contact_id',
                model: 'Contact',
                select: { '_id': 1, 'firstname': 1, 'lastname': 1 },
                populate: {
                    path: 'branch_id',
                    model: 'Branch',
                    select: { '_id': 1, 'label': 1 },
                    populate: {
                        path: 'company_id',
                        model: 'Company',
                        select: { '_id': 1, 'label': 1 },
                    }
                }
            },
            {
                path: 'user_id',
                model: 'User',
                select: { 'username': 1, 'short_username': 1 },
            }

            ]
            ).exec();

        logger.debug('fetched mycalls');

        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        //console.log(calls);
        res.json(calls);
    } catch (err) {
        logger.error(err, "getMyCalls");
        return res.status(404).json({ "message": 'aomething went sideways, in getmycalls' });
    }

}

const getAllCalls = async (req, res) => {
    try {
        logger.trace("getAllCalls");
        logger.trace(req);

        const searchParams = await parseQuery(req);



        const calls = await Call.find(searchParams)
            .sort({ call_date: -1 })
            .populate([{
                path: 'contact_id',
                model: 'Contact',
                select: { '_id': 1, 'firstname': 1, 'lastname': 1 },
                populate: {
                    path: 'branch_id',
                    model: 'Branch',
                    select: { '_id': 1, 'label': 1 },
                    populate: {
                        path: 'company_id',
                        model: 'Company',
                        select: { '_id': 1, 'label': 1 },
                    }
                }
            },
            {
                path: 'user_id',
                model: 'User',
                select: 'username',
            }

            ]
            ).exec();


        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        logger.debug('fetched allcalls');
        res.json(calls);
    } catch (err) {
        logger.error(err, "getAllCalls");
        return res.status(404).json({ "message": 'aomething went sideways, in getAllCalls' });
    }

}

// const getCallByBranch = async (req, res) => {
//     if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
//     //need to get user_id of user
//     try {
//         logger.trace("getCallByBranch");
//         const searchParams = await parseQueryOnlyMine(req);
//         searchParams.branch_id = req.params.id;
//         //searchParams.active=true;

//         const contacts = await Contact.find({ branch_id: req.params.id, active: true });
//         const calls = [];
//         //iterate contacts sand get calls for each
//         for (const contact of contacts) {
//             const thisParams = {};
//             thisParams.contact_id = contact._doc._id;

//             var thisCalls = await Call.find({ ...searchParams, ...thisParams }).lean().exec();
//             if (thisCalls) {
//                 //calls.concat(thisCalls);
//                 Array.prototype.push.apply(calls, thisCalls);
//             }
//         }

//         if (!calls) return res.status(204).json({ 'message': 'No calls found' });
//         res.json(calls);
//     } catch (err) {
//         logger.error(err, "failed getting calls by branch");
//         return res.status(404).json({ "message": 'aomething went sideways, in getCallByBranch' });
//     }


// }

// const getAllCallByBranch = async (req, res) => {
//     if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
//     //need to get user_id of user
//     try {
//         logger.trace("getAllCallByBranch");
//         const searchParams = await parseQuery(req);
//         searchParams.branch_id = req.params.id;
//         //searchParams.active=true;

//         const contacts = await Contact.find({ branch_id: req.params.id, active: true });
//         const calls = [];
//         //iterate contacts sand get calls for each
//         for (const contact of contacts) {
//             const thisParams = {};
//             thisParams.contact_id = contact._doc._id;

//             var thisCalls = await Call.find({ ...searchParams, ...thisParams }).lean().exec();
//             if (thisCalls) {
//                 //calls.concat(thisCalls);
//                 Array.prototype.push.apply(calls, thisCalls);
//             }
//         }

//         if (!calls) {
//             logger.debug("fetched zero calls by branch");
//             return res.status(204).json({ 'message': 'No calls found' });
//         }
//         res.json(calls);
//     } catch (err) {
//         logger.error(err,"getAllCallByBranch");
//         return res.status(404).json({ "message": 'aomething went sideways, in getCallByBranch' });
//     }


// }

// const getCallByContact = async (req, res) => {

//     try {
//         if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
//         var searchParams = await parseQueryOnlyMine(req);
//         searchParams.contact_id = req.params.id;
//         const calls = await Call.find(searchParams);
//         if (!calls) return res.status(204).json({ 'message': 'No calls found' });
//         res.json(calls);
//     } catch (err) {
//         console.error(err);
//         return res.status(404).json({ "message": 'aomething went sideways, in getCallByContact' });
//     }

// }

// const getAllCallByContact = async (req, res) => {

//     try {
//         if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
//         var searchParams = await parseQuery(req);
//         searchParams.contact_id = req.params.id;
//         const calls = await Call.find(searchParams);
//         if (!calls) return res.status(204).json({ 'message': 'No calls found' });
//         res.json(calls);
//     } catch (err) {
//         console.error(err);
//         return res.status(404).json({ "message": 'aomething went sideways, in getCallByContact' });
//     }

// }

//TOTEST:
const getCall = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'call ID required.' });
    try {
        const call = await Call.findOne({ _id: req.params.id }).exec();
        if (!call) {
            return res.status(204).json({ "message": `No call matches ID ${req.params.id}.` });
        }

        if (!boolVerifyRoles(req.roles, ROLES_LIST.Admin)) {
            //we only need to check this for mere mortals

            //if only a user, need to verify they aren't looking at anyone else's calls
            const thisUser = await User.findOne({ username: req.user }).lean().exec();
            const myUserId = thisUser._id;
            callUserId = call._doc.user_id;
            if (JSON.stringify(myUserId) !== JSON.stringify(callUserId)) {
                console.warn('attempted to retreive another person\'s call');
                return res.status(401).json({ "message": 'You are not authorized to see that entry' });
            }
        }
        res.json(call);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ "message": 'aomething went sideways, in getcall' });
    }
}

module.exports = {
    createNewCall,
    // updateCall,
    // deleteCall,
    // getCallByContact,
    getCall,
    getMyCalls,
    // getCallByBranch,
    getAllCalls
    // getAllCallByContact,
    // getAllCallByBranch
}