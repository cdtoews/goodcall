const CallType = require('../model/CallType');

const getAllCallTypes = async (req, res) => {
    const flags = await CallType.find().sort({label: 1});
    if (!flags) return res.status(204).json({ 'message': 'No CallType found.' });
    res.json(flags);
}


const createNewCallType = async (req, res) => {
    if (!req?.body?.label ) {
        return res.status(400).json({ 'message': 'label is required' });
    }

    try {
        const result = await CallType.create({
            label: req.body.label
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}


module.exports = { 
    getAllCallTypes,
    createNewCallType
};