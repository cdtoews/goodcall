const Branch = require('../model/Branch');

const getBranchesByCompany = async (req, res) => {
    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'Company ID required.' });

        const branches = await Branch.find({ company_id: req.params.id, active: true }).sort({ label: 1 }).exec();
        if (!branches) {
            return res.status(204).json({ "message": `No branches matches company ID ${req.params.id}.` });
        }
        res.json(branches);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'something went sideways' });

    }
}

const getAllBranchesByCompany = async (req, res) => {
    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'Company ID required.' });

        const branches = await Branch.find({ company_id: req.params.id }).sort({ label: 1 }).exec();
        if (!branches) {
            return res.status(204).json({ "message": `No branches matches company ID ${req.params.id}.` });
        }
        res.json(branches);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'something went sideways' });

    }
}


const createNewBranch = async (req, res) => {
    const { label, company_id } = req.body;
    if (!label || !company_id) return res.status(400).json({ 'message': 'label and company_id are required.' });

    try {
        const result = await Branch.create({
            label: req.body.label,
            company_id: req.body.company_id
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'Something wonky happened creating branch' });
    }
}

const updateBranch = async (req, res) => {
    try {
        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }

        const branch = await Branch.findOne({ _id: req.body.id }).exec();
        if (!branch) {
            return res.status(204).json({ "message": `No branch matches ID ${req.body.id}.` });
        }
        //TODO check for all params
        if (req.body?.label) branch.label = req.body.label;
        branch.active = req.body.active;
        const result = await branch.save();
        res.json(result);
    } catch (err) {
        logger.error(err, "trouble updating branch")
    }


}

const deactivateBranch = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Branch ID required.' });
    const branch = await Branch.findOne({ _id: req.body.id }).exec();
    if (!branch) {
        return res.status(204).json({ "message": `No branch matches ID ${req.body.id}.` });
    }

    branch.active = false;
    const result = await branch.save();
    res.json(result);
}

const activateBranch = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'branch ID required.' });
    const branch = await Branch.findOne({ _id: req.body.id }).exec();
    if (!branch) {
        return res.status(204).json({ "message": `No company matches ID ${req.body.id}.` });
    }

    branch.active = true;
    const result = await branch.save();
    res.json(result);
}

const getBranch = async (req, res) => {
    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'branch ID required.' });

        const branch = await Branch.findOne({ _id: req.params.id }).exec();
        if (!branch) {
            return res.status(204).json({ "message": `No branch matches ID ${req.params.id}.` });
        }
        res.json(branch);
    } catch (err) {
        console.error(err);
        return res.status(400)
    }
}

const getBranchObject = async (branchId) => {
    try {
        const branch = await Branch.findOne({ _id: branchId }).exec();
        if (!branch) {
            console.warn("unable to get branch object for id: " + branchId)
            return null;
        }
        return branch;
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getBranchesByCompany,
    getAllBranchesByCompany,
    createNewBranch,
    updateBranch,
    deactivateBranch,
    activateBranch,
    getBranch,
    getBranchObject
}