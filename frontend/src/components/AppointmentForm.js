import React, { useState, useEffect } from 'react';
import '../styles/AppointmentForm.css';

function AppointmentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    notes: ''
  });

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, appointmentDate: today }));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const services = [
    'Teeth Cleaning',
    'Dental Filling',
    'Tooth Extraction',
    'Root Canal',
    'Braces Consultation',
    'Teeth Whitening',
    'Regular Checkup'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  return (
    <div className="form-section">
      <h3><i className="fas fa-calendar-plus"></i> New Appointment</h3>
      
      <form id="appointmentForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientName"><i className="fas fa-user"></i> Full Name</label>
          <input
            type="text"
            id="patientName"
            required
            placeholder="Enter your full name"
            value={formData.patientName}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientEmail"><i className="fas fa-envelope"></i> Email</label>
            <input
              type="email"
              id="patientEmail"
              required
              placeholder="Enter your email"
              value={formData.patientEmail}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientPhone"><i className="fas fa-phone"></i> Phone Number</label>
            <input
              type="tel"
              id="patientPhone"
              required
              placeholder="Enter your phone number"
              value={formData.patientPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointmentDate"><i className="fas fa-calendar-day"></i> Appointment Date</label>
            <input
              type="date"
              id="appointmentDate"
              required
              value={formData.appointmentDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="appointmentTime"><i className="fas fa-clock"></i> Preferred Time</label>
            <select
              id="appointmentTime"
              required
              value={formData.appointmentTime}
              onChange={handleChange}
            >
              <option value="">Select a time</option>
              {timeSlots.map(time => {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                return (
                  <option key={time} value={time}>
                    {formattedHour}:{minutes} {ampm}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="serviceType"><i className="fas fa-teeth"></i> Service Required</label>
          <select
            id="serviceType"
            required
            value={formData.serviceType}
            onChange={handleChange}
          >
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service.toLowerCase().replace(' ', '_')}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes"><i className="fas fa-notes-medical"></i> Additional Notes</label>
          <textarea
            id="notes"
            rows="3"
            placeholder="Any specific concerns or notes..."
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn-primary">
          <i className="fas fa-paper-plane"></i> Book Appointment
        </button>
      </form>
    </div>
  );
}

export default AppointmentForm;
