const Call = require('../model/Call');
const User = require('../model/User');
const Contact = require('../model/Contact');
const { th } = require('date-fns/locale');

function getUserObject(req) {
    //we have req.user, which is the username
    const thisUser = User.findOne({ username: req.user }).lean().exec();
    return thisUser;
}

//TOTEST
const createNewCall = async (req, res) => {

    //we have req.user, which is the username
    const thisUser = await getUserObject(req, res);

    if (!req?.body?.contact_id ||
        !req?.body?.call_type) {
        return res.status(400).json({ 'message': 'Required fields: contact_id,  call_type ' });
    }

    try {
        const newCall = new Call();
        newCall.user_id = thisUser._id;
        newCall.contact_id = req.body.contact_id;
        newCall.notes = req.body.notes;
        newCall.call_type = req.body.call_type;
        newCall.call_flag = req.body.call_flag;
        if (req.body?.call_date) newCall.call_date = req.body.call_date;

        const result = newCall.save();

        res.status(201).json(newCall);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'Something wonky happened creating call' });
    }
}


//TOTEST:
const updateCall = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const call = await Call.findOne({ _id: req.body.id }).exec();
    if (!call) {
        return res.status(204).json({ "message": `No call matches ID ${req.body.id}.` });
    }
    if (req.body?.contact_id) call.contact_id = req.body.contact_id;
    if (req.body?.user_id) call.user_id = req.body.user_id;
    if (req.body?.call_date) call.call_date = req.body.call_date;
    if (req.body?.notes) call.notes = req.body.notes;
    if (req.body?.call_type) call.call_type = req.body.call_type;
    if (req.body?.call_flag) call.call_flag = req.body.call_flag;
    const result = await call.save();
    res.json(result);
}

const deleteCall = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'call ID required.' });
    const call = await Call.findOne({ _id: req.body.id }).exec();
    if (!call) {
        return res.status(204).json({ "message": `No call matches ID ${req.body.id}.` });
    }
    const result = await call.deleteOne({ _id: req.body.id });
    res.json(result);
}

//----------------- MINE --------------------


const getMyCalls = async (req, res) => {
    try {

        const thisUser = await getUserObject(req);

        const calls = await Call.find({ user_id: thisUser._id });
        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        res.json(calls);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ "message": 'aomething went sideways, in getmycalls' });
    }

}

//TOTEST
const getCallByBranch = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
    //need to get user_id of user
    try {
        //we have req.user, which is the username
        const thisUser = await getUserObject(req, res);


        const contacts = await Contact.find({ branch_id: req.params.id, active: true });
        const calls = [];
        //iterate contacts sand get calls for each
        contacts.forEach(function (thisContact) {
            var thisCalls = Call.find({ contact_id: req.params.id, user_id: thisUser._id }).lean().exec();
            if (thisCalls) calls.concat(thisCalls);

        })



        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        res.json(calls);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ "message": 'aomething went sideways, in getCallByBranch' });
    }


}


//TOTEST
const getCallByContact = async (req, res) => {

    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });
        //need to get user_id of user
        //we have req.user, which is the username
        const thisUser = await getUserObject(req, res);

        const calls = await Call.find({ contact_id: req.params.id, user_id: thisUser._id });
        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        res.json(calls);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ "message": 'aomething went sideways, in getCallByContact' });
    }

}

//TOTEST:
const getCall = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'call ID required.' });
    try {
        const call = await Call.findOne({ _id: req.params.id }).exec();
        if (!call) {
            return res.status(204).json({ "message": `No call matches ID ${req.params.id}.` });
        }
        res.json(call);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ "message": 'aomething went sideways, in getcall' });
    }

}

module.exports = {
    createNewCall,
    updateCall,
    deleteCall,
    getCallByContact,
    getCall,
    getMyCalls,
    getCallByBranch
}