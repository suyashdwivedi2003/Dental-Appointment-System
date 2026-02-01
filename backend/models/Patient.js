const mongoose = require('mongoose');
const validator = require('validator');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^[\+]?[1-9][\d]{0,15}$/.test(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        }
    },
    medicalHistory: {
        allergies: [String],
        medications: [String],
        conditions: [String],
        lastDentalVisit: Date
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    insurance: {
        provider: String,
        policyNumber: String,
        groupNumber: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ phone: 1 });
patientSchema.index({ name: 1 });
patientSchema.index({ createdAt: -1 });

// Method to get patient's age
patientSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
});

// Method to get formatted address
patientSchema.methods.getFormattedAddress = function() {
    const { street, city, state, zipCode, country } = this.address;
    return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
};

// Static method to find patients by name (case-insensitive)
patientSchema.statics.findByName = function(name) {
    return this.find({ 
        name: new RegExp(name, 'i'),
        isActive: true 
    });
};

// Update timestamp on save
patientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;