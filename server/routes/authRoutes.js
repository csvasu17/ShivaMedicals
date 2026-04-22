const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/me', authController.getMe);
router.post('/active', authController.updateLastActive);
router.post('/logout-activity', authController.clearLastActive);

module.exports = router;
