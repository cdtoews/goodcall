const express = require('express');
const router = express.Router();
const callController = require('../../controllers/callController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.createNewCall)
    .delete(verifyRoles(ROLES_LIST.Admin), callController.deleteCall)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), callController.updateCall);

//mine. this will get calls only for JUST YOU
router.route('/mine')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getMyCalls);

router.route('/mine/bycontact/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getCallByContact);

router.route('/mine/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getCallByBranch);

router.route('/:id')
    .get(callController.getCall);



//TODO   TOTEST
router.route('/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.updateCall);

//TODO   TOTEST
router.route('/byuser/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.updateCall);



module.exports = router;