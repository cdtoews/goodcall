const express = require('express');
const router = express.Router();
const branchController = require('../../controllers/branchController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), branchController.createNewBranch)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), branchController.updateBranch);

router.route('/:id')
    .get(branchController.getBranch);

// router.route('/activate')
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), branchController.activateBranch);

// router.route('/deactivate')
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), branchController.deactivateBranch);

router.route('/bycompany/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), branchController.getBranchesByCompany);

router.route('/allbycompany/:id')
    .get(verifyRoles(ROLES_LIST.Admin), branchController.getAllBranchesByCompany)

module.exports = router;
