const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    //.delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser)
    .post(verifyRoles(ROLES_LIST.Admin), usersController.updateUser);

router.route('/list')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getUserList);

router.route('/myinfo')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), usersController.getMyUser);

router.route('/newuser')
    .post(verifyRoles(ROLES_LIST.Admin), usersController.createNewUser);

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser);

module.exports = router;