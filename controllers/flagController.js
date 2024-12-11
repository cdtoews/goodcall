const Flag = require('../model/Flag');

const getAllFlags = async (req, res) => {
    try{
    const flags = await Flag.find().sort({label: 1});
    if (!flags) return res.status(204).json({ 'message': 'No Flags found.' });
    res.json(flags);
    }catch(err){
        console.error(err);
    }
}


const createNewFlag = async (req, res) => {
     if (!req?.body?.label ) {
        return res.status(400).json({ 'message': 'label is required' });
    }

    try {
        const result = await Flag.create({
            label: req.body.label
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}


module.exports = { 
    getAllFlags,
    createNewFlag
};