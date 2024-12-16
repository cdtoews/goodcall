const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');




router.route('/scfr')
    .get(verifyRoles(ROLES_LIST.Admin), adminController.getSalesCallFreqReport)
    

router.route('/msr')
    .get(verifyRoles(ROLES_LIST.Admin), adminController.getMonthlySummeryReport)

module.exports = router;
