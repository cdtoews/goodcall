const Company = require('../model/Company');

const getAllCompanies = async (req, res) => {
    //console.log("inside gac");
    const companies = await Company.find({ active: true }).sort({ label: 1 });
    if (!companies) return res.status(204).json({ 'message': 'No companies found.' });
    res.json(companies);
}

const createNewCompany = async (req, res) => {
    if (!req?.body?.label) {
        return res.status(400).json({ 'message': 'label is required' });
    }

    try {
        const result = await Company.create({
            label: req.body.label
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateCompany = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const company = await Company.findOne({ _id: req.body.id }).exec();
    if (!company) {
        return res.status(204).json({ "message": `No company matches ID ${req.body.id}.` });
    }
    //TODO check for all params
    if (req.body?.label) company.label = req.body.label;
    if (req.body?.active) company.active = req.body.active;
    const result = await company.save();
    res.json(result);
}

//TOTEST:
const deactivateCompany = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'company ID required.' });
    const company = await Company.findOne({ _id: req.body.id }).exec();
    if (!company) {
        return res.status(204).json({ "message": `No company matches ID ${req.body.id}.` });
    }

    company.active = false;
    const result = await company.save();
    res.json(result);
}

//TOTEST:
const activateCompany = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'company ID required.' });
    const company = await Company.findOne({ _id: req.body.id }).exec();
    if (!company) {
        return res.status(204).json({ "message": `No company matches ID ${req.body.id}.` });
    }

    company.active = true;
    const result = await company.save();
    res.json(result);
}

//TOTEST
const getCompany = async (req, res) => {
    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'Company ID required.' });

        const company = await Company.findOne({ _id: req.params.id }).exec();
        if (!company) {
            return res.status(204).json({ "message": `No company matches ID ${req.params.id}.` });
        }
        res.json(company);
    } catch (err) {
        console.error(err);
    }
}

const getCompanyName = async (companyId) => {
    try {
        const company = await Company.findOne({ _id: companyId }).exec();
        if (!company) {
            console.log("unable to get company for id: " + companyId);
            return null;
        }
        return company.label;
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getAllCompanies,
    createNewCompany,
    updateCompany,
    deactivateCompany,
    activateCompany,
    getCompany,
    getCompanyName
}