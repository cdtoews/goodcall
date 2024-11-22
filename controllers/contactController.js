const Contact = require('../model/Contact');

//TOTEST:
const createNewContact = async (req, res) => {
    if (!req?.body?.firstname || !req?.body?.lastname) {
        return res.status(400).json({ 'message': 'First and last names are required' });
    }

    try {
        const result = await Contact.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

//TOTEST:
const updateContact = async (req, res) => {
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
    if (req.body?.active) contact.active = req.body.active;
    const result = await contact.save();
    res.json(result);
}

//TOTEST:
const deactivateContact = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'contact ID required.' });
    const contact = await Contact.findOne({ _id: req.body.id }).exec();
    if (!contact) {
        return res.status(204).json({ "message": `No contact matches ID ${req.body.id}.` });
    }
    //const result = await employee.deleteOne({ _id: req.body.id }); //{ _id: req.body.id } //in original deleteOne was empty
    contact.active = false;
    const result = await contact.save();
    res.json(result);
}

//TOTEST:
const activateContact = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'contact ID required.' });
    const contact = await Contact.findOne({ _id: req.body.id }).exec();
    if (!contact) {
        return res.status(204).json({ "message": `No contact matches ID ${req.body.id}.` });
    }
    //const result = await employee.deleteOne({ _id: req.body.id }); //{ _id: req.body.id } //in original deleteOne was empty
    contact.active = true;
    const result = await contact.save();
    res.json(result);
}

//TOTEST
const getContactByBranch = async (req, res) => {
    const contacts = await Contact.find({branch_id: req.params.branch_id});
    if (!contacts) return res.status(204).json({ 'message': 'No contacts found' });
    res.json(contacts);
}

//TOTEST:
const getContact = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'contact ID required.' });

    const contact = await Contact.findOne({ _id: req.params.id }).exec();
    if (!contact) {
        return res.status(204).json({ "message": `No contact matches ID ${req.params.id}.` });
    }
    res.json(contact);
}

module.exports = {
    createNewContact,
    updateContact,
    deactivateContact,
    activateContact,
    getContactByBranch,
    getContact
}