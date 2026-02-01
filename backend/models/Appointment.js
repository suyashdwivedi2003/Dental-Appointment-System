const mongoose = require('mongoose');
const Patient = require('./Patient');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        // required: [true, 'Patient ID is required']
    },
    patientName: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    patientEmail: {
        type: String,
        required: [true, 'Patient email is required'],
        lowercase: true,
        trim: true
    },
    patientPhone: {
        type: String,
        required: [true, 'Patient phone is required']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function(value) {
                return value >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'Appointment date cannot be in the past'
        }
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        enum: {
            values: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
            message: 'Invalid time slot. Please select from available slots'
        }
    },
    service: {
        type: String,
        required: [true, 'Service type is required'],
        enum: {
            values: [
                'cleaning', 
                'filling', 
                'extraction', 
                'root_canal', 
                'braces', 
                'whitening', 
                'checkup',
                'emergency',
                'consultation',
                'xray'
            ],
            message: 'Invalid service type'
        }
    },
    dentist: {
        type: String,
        default: 'Dr. Smith',
        enum: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    duration: {
        type: Number,
        default: 30,
        min: [15, 'Minimum duration is 15 minutes'],
        max: [120, 'Maximum duration is 120 minutes']
    },
    reminders: {
        emailSent: {
            type: Boolean,
            default: false
        },
        smsSent: {
            type: Boolean,
            default: false
        },
        sentAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    cancellationReason: String,
    cancelledAt: Date
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate appointments
appointmentSchema.index({ date: 1, time: 1, patientId: 1 }, { unique: true });

// Index for querying appointments by date and status
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for formatted date and time
appointmentSchema.virtual('formattedDateTime').get(function() {
    const date = new Date(this.date);
    return {
        date: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        time: this.time,
        formattedTime: this.formatTime()
    };
});

// Method to format time for display
appointmentSchema.methods.formatTime = function() {
    const [hours, minutes] = this.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
    const appointmentDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':');
    appointmentDateTime.setHours(hours, minutes);
    return appointmentDateTime > new Date();
};

// Static method to find available time slots for a date
appointmentSchema.statics.getAvailableSlots = async function(date) {
    const allSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    const bookedSlots = await this.find({
        date: date,
        status: { $in: ['confirmed', 'pending'] }
    }).select('time');
    
    const bookedTimes = bookedSlots.map(slot => slot.time);
    return allSlots.filter(slot => !bookedTimes.includes(slot));
};

// Static method to check slot availability with collision prevention
appointmentSchema.statics.checkSlotAvailability = async function(date, time, patientId = null) {
    const existingAppointment = await this.findOne({
        date: date,
        time: time,
        status: { $in: ['confirmed', 'pending'] },
        ...(patientId && { patientId: { $ne: patientId } })
    });
    
    return !existingAppointment;
};

// Static method to get appointment statistics
appointmentSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                confirmed: { 
                    $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } 
                },
                pending: { 
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
                },
                completed: { 
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
                },
                cancelled: { 
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } 
                }
            }
        }
    ]);
    
    return stats[0] || { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
};

// Middleware to validate appointment before save
appointmentSchema.pre('save', async function(next) {
    // Update timestamp
    this.updatedAt = new Date();
    
    // Check for duplicate appointment
    const existingAppointment = await this.constructor.findOne({
        date: this.date,
        time: this.time,
        patientId: this.patientId,
        _id: { $ne: this._id }
    });
    
    if (existingAppointment) {
        const error = new Error('Duplicate appointment found');
        error.status = 409;
        return next(error);
    }
    
    // Validate appointment date is not in the past
    const appointmentDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
        const error = new Error('Cannot book appointments in the past');
        error.status = 400;
        return next(error);
    }
    
    next();
});

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledAt = new Date();
    return this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = async function(newDate, newTime) {
    const isAvailable = await this.constructor.checkSlotAvailability(newDate, newTime, this.patientId);
    
    if (!isAvailable) {
        throw new Error('Selected slot is not available');
    }
    
    this.date = newDate;
    this.time = newTime;
    return this.save();
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;