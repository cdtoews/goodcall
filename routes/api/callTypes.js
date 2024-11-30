const express = require('express');
const router = express.Router();
const callTypeController = require('../../controllers/callTypeController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callTypeController.getAllCallTypes)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), callTypeController.createNewCallType);
   
    

module.exports = router;
