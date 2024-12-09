const express = require('express');
const router = express.Router();
const pwResetController = require('../../controllers/pwResetController')


router.post('/', pwResetController.handlePwResetRequest)
router.post('/link', pwResetController.handlePwResetLink)

module.exports = router;
