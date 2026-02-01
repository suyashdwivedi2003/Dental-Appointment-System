const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// IMPORTANT: Specific routes MUST come before parameter routes like /:id
// Routes are matched in order - first match wins!

// ===== SPECIFIC ROUTES (MUST come before /:id) =====

// Get available time slots
router.get('/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }
        
        const availableSlots = await Appointment.getAvailableSlots(new Date(date));
        res.json({ date, availableSlots });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots', details: error.message });
    }
});

router.get('/hello', async (req, res) => {
    res.send("Hello from patients route");
});


// Check slot availability
router.get('/check-availability', async (req, res) => {
    try {
        const { date, time, patientId } = req.query;
        
        if (!date || !time) {
            return res.status(400).json({ 
                error: 'Date and time parameters are required' 
            });
        }
        
        const isAvailable = await Appointment.checkSlotAvailability(
            new Date(date), 
            time, 
            patientId
        );
        
        res.json({ date, time, available: isAvailable });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Error checking availability', details: error.message });
    }
});

// Get recent appointments
router.get('/recent', async (req, res) => {
    try {
        const appointments = await Appointment.find({
            date: { $gte: new Date() },
            status: { $in: ['confirmed', 'pending'] }
        })
        .sort({ date: 1, time: 1 })
        .limit(10);
        
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching recent appointments:', error);
        res.status(500).json({ error: 'Error fetching recent appointments', details: error.message });
    }
});

// Get appointment statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Appointment.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Error fetching statistics', details: error.message });
    }
});

// Get appointments by date range
router.get('/range/:start/:end', async (req, res) => {
    try {
        const { start, end } = req.params;
        
        const appointments = await Appointment.find({
            date: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        })
        .sort({ date: 1, time: 1 });
        
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments by range:', error);
        res.status(500).json({ error: 'Error fetching appointments', details: error.message });
    }
});

// ===== GENERIC ROUTES (root and POST) =====

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const { status, date, patientId } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (date) filter.date = new Date(date);
        if (patientId) filter.patientId = patientId;
        
        const appointments = await Appointment.find(filter)
            .sort({ date: 1, time: 1 })
            .limit(100);
        
        console.log('Fetched appointments:', appointments.length);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Error fetching appointments', details: error.message });
    }
});

// Create new appointment
router.post('/', async (req, res) => {
    try {
        const { 
            patientName, 
            patientEmail, 
            patientPhone, 
            date, 
            time, 
            service, 
            notes 
        } = req.body;
        
        // Find or create patient
        let patient = await Patient.findOne({ email: patientEmail.toLowerCase() });
        
        if (!patient) {
            patient = new Patient({
                name: patientName,
                email: patientEmail,
                phone: patientPhone
            });
            await patient.save();
        }
        
        // Check slot availability
        const isAvailable = await Appointment.checkSlotAvailability(
            new Date(date), 
            time, 
            patient._id
        );
        
        if (!isAvailable) {
            return res.status(409).json({ 
                error: 'Selected time slot is not available' 
            });
        }
        
        // Create appointment
        const appointment = new Appointment({
            patientId: patient._id,
            patientName,
            patientEmail,
            patientPhone,
            date: new Date(date),
            time,
            service,
            notes,
            status: 'confirmed'
        });
        
        await appointment.save();
        
        res.status(201).json(appointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: 'Duplicate appointment detected' 
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Error creating appointment', details: error.message });
    }
});

// ===== PARAMETER ROUTES (:id) - MUST come LAST =====

// Reschedule appointment
router.post('/:id/reschedule', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid appointment ID format' });
        }
        
        const { date, time } = req.body;
        
        if (!date || !time) {
            return res.status(400).json({ 
                error: 'Date and time are required for rescheduling' 
            });
        }
        
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        await appointment.reschedule(new Date(date), time);
        
        res.json(appointment);
    } catch (error) {
        if (error.message === 'Selected slot is not available') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ error: 'Error rescheduling appointment', details: error.message });
    }
});

router.get('/hello', async (req, res) => {
    res.send("Hello from patients route");
});
// Cancel appointment
router.post('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid appointment ID format' });
        }
        
        const { reason } = req.body;
        
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        await appointment.cancel(reason || 'Cancelled by patient');
        
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Error cancelling appointment', details: error.message });
    }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid appointment ID format' });
        }
        
        const appointment = await Appointment.findById(id)
            .populate('patientId', 'name email phone');
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        res.json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ error: 'Error fetching appointment', details: error.message });
    }
});

// Update appointment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid appointment ID format' });
        }
        
        const { status, date, time, service, notes } = req.body;
        const updateData = {};
        
        if (status) updateData.status = status;
        if (date) updateData.date = new Date(date);
        if (time) updateData.time = time;
        if (service) updateData.service = service;
        if (notes !== undefined) updateData.notes = notes;
        
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        res.json(appointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: 'Duplicate appointment detected' 
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Error updating appointment', details: error.message });
    }
});

// Delete appointment (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid appointment ID format' });
        }
        
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        appointment.status = 'cancelled';
        appointment.cancellationReason = 'Cancelled by admin';
        appointment.cancelledAt = new Date();
        
        await appointment.save();
        
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Error deleting appointment', details: error.message });
    }
});

module.exports = router;
