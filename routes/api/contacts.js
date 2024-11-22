const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.createNewContact)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.updateContact);


router.route('/:id')
    .get(contactController.getContact);

//TODO   TOTEST
router.route('/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.getContactByBranch);

//TOTEST
router.route('/activate')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.activateContact);

//TOTEST
router.route('/deactivate')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.deactivateContact);

module.exports = router;