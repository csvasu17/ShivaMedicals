const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

router.post('/login', authController.adminLogin);
router.get('/bookings', adminController.getBookings);
router.get('/stats', adminController.getDashboardStats);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.put('/bookings/:id/checkin', adminController.checkInBooking);
router.put('/bookings/:id/reactivate', adminController.reactivateBooking);
router.put('/bookings/:id/payment', adminController.updatePaymentStatus);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);
router.post('/queue/call-next', adminController.callNext);
router.get('/staff', adminController.getStaff);
router.get('/staff/active', adminController.getActiveStaff);
router.post('/staff', adminController.addStaff);
router.put('/staff/:id', adminController.updateStaff);
router.delete('/staff/:id', adminController.deleteStaff);
router.get('/doctors', adminController.getDoctors);
router.post('/doctors', adminController.addDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.get('/doctors/:id/availability', adminController.getDoctorAvailability);
router.put('/doctors/:id/availability', adminController.toggleDoctorAvailability);
router.get('/doctor-types', adminController.getDoctorTypes);
router.post('/doctor-types', adminController.addDoctorType);

router.delete('/doctors/:id', adminController.deleteDoctor);

router.get('/attendance', adminController.getAttendance);
router.get('/attendance/report', adminController.getAttendanceReport);
router.post('/attendance', adminController.markAttendance);
router.post('/attendance/bulk', adminController.submitBulkAttendance);
router.put('/settings', adminController.updateSystemSettings);
router.put('/sessions/:sessionId/restrictions', adminController.updateSessionRestriction);

module.exports = router;
