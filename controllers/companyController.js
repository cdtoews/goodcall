const Company = require('../model/Company');
const logger = require('../middleware/logger');

const getAllCompanies = async (req, res) => {
    logger.trace("getAllCompanies");
    try {
        const companies = await Company.find({ active: true }).sort({ label: 1 });
        if (!companies) {
            logger.info("no companies found");
            return res.status(204).json({ 'message': 'No companies found.' });
        }
        logger.trace(companies);
        res.json(companies);
    } catch (err) {
        logger.error(err, "problem getting all companies");
        return res.status(400).json({ 'message': 'problem getting all companies' });
    }
}
const getAllAllCompanies = async (req, res) => {
    logger.trace("getAllCompanies");
    try {
        const companies = await Company.find().sort({ label: 1 });
        if (!companies) {
            logger.info("no companies found");
            return res.status(204).json({ 'message': 'No companies found.' });
        }
        logger.trace(companies);
        res.json(companies);
    } catch (err) {
        logger.error(err, "problem getting all companies");
        return res.status(400).json({ 'message': 'problem getting all companies' });
    }
}


const createNewCompany = async (req, res) => {
    logger.trace("createNewCompany");
    if (!req?.body?.label) {
        logger.info("no label given for new company");
        return res.status(400).json({ 'message': 'label is required' });
    }

    try {
        const result = await Company.create({
            label: req.body.label
        });
        logger.trace(result);
        res.status(201).json(result);
    } catch (err) {
        logger.error(err, "problem creating company");
        console.error(err);
    }
}

const updateCompany = async (req, res) => {
    try {
        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }

        const company = await Company.findOne({ _id: req.body.id }).exec();
        if (!company) {
            return res.status(204).json({ "message": `No company matches ID ${req.body.id}.` });
        }
        //TODO check for all params
        if (req.body?.label) company.label = req.body.label;
        company.active = req.body.active;

        const result = await company.save();

        res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'Something wonky happened updating company' });
    }



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
        logger.trace("getCompany");
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
            console.error("unable to get company for id: " + companyId);
            return null;
        }
        return company.label;
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getAllCompanies,
    getAllAllCompanies,
    createNewCompany,
    updateCompany,
    deactivateCompany,
    activateCompany,
    getCompany,
    getCompanyName
}