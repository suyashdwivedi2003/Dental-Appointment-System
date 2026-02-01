const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// IMPORTANT: Specific routes must come BEFORE generic parameter routes
// Otherwise, /search/value will match /:id first!

// Test route
router.get('/hello', async (req, res) => {
    res.send("Hello from patients route");
});

// Search patients - MUST come before /:id
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const patients = await Patient.find({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                        { phone: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .limit(20);
        
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Error searching patients' });
    }
});

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(100);
        
        console.log('Fetched patients:', patients.length);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error fetching patients', details: error.message });
    }
});

// Create new patient
router.post('/', async (req, res) => {
    try {
        const existingPatient = await Patient.findOne({ 
            email: req.body.email.toLowerCase() 
        });
        
        if (existingPatient) {
            return res.status(400).json({ 
                error: 'Patient with this email already exists' 
            });
        }
        
        const patient = new Patient(req.body);
        await patient.save();
        
        res.status(201).json(patient);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Error creating patient' });
    }
});

// Nested routes for :id - MUST come before /:id
// Get patient appointments
router.get('/:id/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patientId: req.params.id
        })
        .sort({ date: -1, time: -1 })
        .limit(50);
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching patient appointments' });
    }
});

// Get patient statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const stats = await Appointment.aggregate([
            {
                $match: {
                    patientId: mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    upcomingAppointments: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $gte: ['$date', new Date()] },
                                        { $in: ['$status', ['confirmed', 'pending']] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    completedAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        res.json(stats[0] || { 
            totalAppointments: 0, 
            upcomingAppointments: 0, 
            completedAppointments: 0 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching patient statistics' });
    }
});

// Generic routes - MUST come LAST
// Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid patient ID format' });
        }
        
        const patient = await Patient.findById(id);
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json(patient);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Error fetching patient', details: error.message });
    }
});

// Update patient
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json(patient);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Error updating patient' });
    }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        // Check if patient has upcoming appointments
        const upcomingAppointments = await Appointment.find({
            patientId: req.params.id,
            date: { $gte: new Date() },
            status: { $in: ['confirmed', 'pending'] }
        });
        
        if (upcomingAppointments.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete patient with upcoming appointments' 
            });
        }
        
        // Soft delete
        patient.isActive = false;
        await patient.save();
        
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting patient' });
    }
});

module.exports = router;