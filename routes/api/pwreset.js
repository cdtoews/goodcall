const express = require('express');
const router = express.Router();
const pwResetController = require('../../controllers/pwResetController')


router.post('/', pwResetController.handlePwResetRequest)
router.get('/:ID', pwResetController.handlePwResetLink)

module.exports = router;
