const User = require('../model/User');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) return res.status(204).json({ 'message': 'No users found' });
    res.json(users);
}

const getAllEmailUsers = async (req, res) => {
    try{
        const users = await User.find({ receive_emails: true });
        if (!users) return [];
        return users;
    }catch(err){
        console.log(err);
        return [];
    }
    
}

//receive_emails

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.body.id} not found` });
    }
    const result = await user.deleteOne({ _id: req.body.id });
    res.json(result);
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.params.id} not found` });
    }
    res.json(user);
}

const getMyUser = async (req, res) => {
    //console.log(req);
    const thisUser = await User.findOne({ username: req.user }).lean().exec();
           // const myUserId = thisUser._id;
          
    if (!thisUser) {
        return res.status(204).json({ 'message': `User ID not found` });
    }
    thisUser.password = "";
    thisUser.refreshToken = [];
    
   // res.end(JSON.stringify(thisUser));
   res.json(thisUser);

}

//TOTEST:
const updateUser = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const user = await user.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.body.id}.` });
    }
    if (req.body?.user) user.firstname = req.body.firstname;
    if (req.body?.user) user.lastname = req.body.lastname;
    if (req.body?.user) user.active = req.body.active;
    if (req.body?.user) user.roles = req.body.roles;
    const result = await employee.save();
    res.json(result);
}

module.exports = {
    getAllUsers,
    getAllEmailUsers,
    deleteUser,
    getUser,
    getMyUser,
    updateUser
}