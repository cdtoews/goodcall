const express = require('express');
const router = express.Router();
const flagController = require('../../controllers/flagController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), flagController.getAllFlags);
    // .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), flagController.createNewFlag);
   
    

module.exports = router;
