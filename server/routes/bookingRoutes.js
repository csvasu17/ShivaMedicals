const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/doctors', bookingController.getDoctors);
router.get('/sessions/:doctorId', bookingController.getSessions);
router.get('/availability', bookingController.getAvailability);
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/my', bookingController.getMyBookings);
router.get('/queue/live/:sessionId/:date', bookingController.getLiveQueue);

module.exports = router;
