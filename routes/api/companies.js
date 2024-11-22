const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/companyController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),companyController.getAllCompanies)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), companyController.createNewCompany)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), companyController.updateCompany)
    

router.route('/:id')
    .get(companyController.getCompany);
    
//TOTEST
router.route('/activate')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), companyController.activateCompany);

//TOTEST
router.route('/deactivate')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), companyController.deactivateCompany);

module.exports = router;
