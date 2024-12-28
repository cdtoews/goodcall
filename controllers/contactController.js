const Contact = require('../model/Contact');
const boolVerifyRoles = require('../middleware/boolVerifyRoles');
const ROLES_LIST = require('../config/roles_list');

const createNewContact = async (req, res) => {

    try {
        if (!req?.body?.firstname || !req?.body?.branch_id) {
            return res.status(400).json({ 'message': 'First name and branch_id are required' });
        }


        const result = await Contact.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            branch_id: req.body.branch_id,
            notes: req.body.notes
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        return res.status(400).json({ 'message': 'Something wonky happened creating contact' });
    }
}

//TOTEST:
const updateContact = async (req, res) => {
    try {




        if (!req?.body?.id) {
            return res.status(400).json({ 'message': 'ID parameter is required.' });
        }

        const contact = await Contact.findOne({ _id: req.body.id }).exec();
        if (!contact) {
            return res.status(204).json({ "message": `No contact matches ID ${req.body.id}.` });
        }
        if (req.body?.firstname) contact.firstname = req.body.firstname;
        if (req.body?.lastname) contact.lastname = req.body.lastname;
        if (req.body?.email) contact.email = req.body.email;
        if (req.body?.phone) contact.phone = req.body.phone;
        if (req.body?.notes) contact.notes = req.body.notes;
        contact.active = req.body.active;
        const result = await contact.save();
        res.json(result);
    } catch (err) {
        console.error(err);
    }

}

//TOTEST:
const deactivateContact = async (req, res) => {
    try {
        if (!req?.body?.id) return res.status(400).json({ 'message': 'contact ID required.' });
        const contact = await Contact.findOne({ _id: req.body.id }).exec();
        if (!contact) {
            return res.status(204).json({ "message": `No contact matches ID ${req.body.id}.` });
        }
        //const result = await employee.deleteOne({ _id: req.body.id }); //{ _id: req.body.id } //in original deleteOne was empty
        contact.active = false;
        const result = await contact.save();
        res.json(result);
    } catch (err) {
        console.error(err);
    }



}

//TOTEST:
const activateContact = async (req, res) => {
    try {
        if (!req?.body?.id) return res.status(400).json({ 'message': 'contact ID required.' });
        const contact = await Contact.findOne({ _id: req.body.id }).exec();
        if (!contact) {
            return res.status(204).json({ "message": `No contact matches ID ${req.body.id}.` });
        }
        //const result = await employee.deleteOne({ _id: req.body.id }); //{ _id: req.body.id } //in original deleteOne was empty
        contact.active = true;
        const result = await contact.save();
        res.json(result);
    } catch (err) {
        console.error(err);
    }


}

//TOTEST
const getContactByBranch = async (req, res) => {
    try {

        if (!req?.params?.id) return res.status(400).json({ 'message': 'Branch ID required.' });
        // console.log(req.roles);

        const contacts = await Contact.find({ branch_id: req.params.id, active: true }).sort({ firstname: 1 });
        if (!contacts) return res.status(204).json({ 'message': 'No contacts found' });
        res.json(contacts);
    } catch (err) {
        console.error(err);
    }



}


const getAllContactByBranch = async (req, res) => {
    try {

        if (!req?.params?.id) return res.status(400).json({ 'message': 'Branch ID required.' });
        // console.log(req.roles);
        //console.log(req.params.id);
        const contacts = await Contact.find({ branch_id: req.params.id }).sort({ firstname: 1 });
        if (!contacts) return res.status(204).json({ 'message': 'No contacts found' });
        //console.log(contacts);
        res.json(contacts);
    } catch (err) {
        console.error(err);
    }



}

//TOTEST:
const getContact = async (req, res) => {
    try {
        if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });

        const contact = await Contact.findOne({ _id: req.params.id }).exec();
        if (!contact) {
            return res.status(204).json({ "message": `No contact matches ID ${req.params.id}.` });
        }
        res.json(contact);
    } catch (err) {
        console.error(err);
    }

}

module.exports = {
    createNewContact,
    updateContact,
    deactivateContact,
    activateContact,
    getContactByBranch,
    getAllContactByBranch,
    getContact
}