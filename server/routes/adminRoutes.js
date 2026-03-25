const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

router.post('/login', authController.adminLogin);
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.post('/queue/call-next', adminController.callNext);

module.exports = router;
