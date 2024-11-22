const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/contactController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    //.get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.getAllEmployees)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), contactController.createNewContact)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.updateContact);

//   .delete(verifyRoles(ROLES_LIST.Admin), contactController.deleteEmployee);

router.route('/:id')
    .get(contactController.getEmployee);

//TODO   TOTEST
router.route('/bybranch/:id')
.put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.fsfsdfsdfsdfsfs);

//TOTEST
router.route('/activate/:id')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.activateContact);

//TOTEST
router.route('/deactivate/:id')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), contactController.deactivateContact);

module.exports = router;