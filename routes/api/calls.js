const express = require('express');
const router = express.Router();
const callController = require('../../controllers/callController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getCall)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.createNewCall)
    .delete(verifyRoles(ROLES_LIST.Admin), callController.deleteCall)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), callController.updateCall);

//mine. this will get calls only for JUST YOU
//   
/*
/calls/mine/?daysback=2
    anything newer than 2 days ag0

/calls/mine/?gt=2024-11-20&lt=2024-11-27
calls between gt and lt (greater than & less than)

*/
//-----------------------  MINE -------------------------
router.route('/mine')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getMyCalls);

router.route('/mine/bycontact/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getCallByContact);

router.route('/mine/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), callController.getCallByBranch);

//---------------------------- ALL -----------------------
router.route('/all')
    .get(verifyRoles(ROLES_LIST.Admin), callController.getAllCalls);

router.route('/all/bycontact/:id')
    .get(verifyRoles(ROLES_LIST.Admin), callController.getAllCallByContact);

router.route('/all/bybranch/:id')
    .get(verifyRoles(ROLES_LIST.Admin), callController.getAllCallByBranch);



router.route('/:id')
    .get(callController.getCall);


module.exports = router;