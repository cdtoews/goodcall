const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/callController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.createNewContact)
    .delete(verifyRoles(ROLES_LIST.Admin), callController.deleteUser)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.updateContact);


router.route('/:id')
    .get(contactController.getContact);

//TODO   TOTEST
router.route('/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getContactByBranch);

//TODO   TOTEST
router.route('/byuser/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getContactByBranch);



module.exports = router;