import React, { useState } from 'react';
import '../styles/Home.css';
import AppointmentForm from '../components/AppointmentForm';
import TimeSlots from '../components/TimeSlots';
import RecentAppointments from '../components/RecentAppointments';
import ConfirmationModal from '../components/ConfirmationModal';
import Notification from '../components/Notification';

function Home() {
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAppointmentSubmit = async (formData) => {
    if (!selectedTime) {
      showNotification('Please select a time slot', 'warning');
      return;
    }

    const appointmentData = {
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      date: formData.appointmentDate,   // YYYY-MM-DD
      time: selectedTime,               // enum-safe
      service: formData.serviceType,    // MUST match backend enum exactly
      notes: formData.notes || '',
      status: 'confirmed'
    };

    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setConfirmationData(data);
      setShowConfirmation(true);
      showNotification('Appointment booked successfully!', 'success');
      setSelectedTime(null);

    } catch (error) {
      console.error('Booking error:', error.message);
      showNotification(error.message, 'error');
    }
  };

  return (
    <>
      <div className="hero">
        <h2>Book Your Dental Appointment Online</h2>
        <p>Fast, secure, and convenient booking system</p>
      </div>

      <div className="appointment-container">
        <AppointmentForm onSubmit={handleAppointmentSubmit} />

        <div>
          <TimeSlots
            onSelectTime={setSelectedTime}
            selectedTime={selectedTime}
          />
          <RecentAppointments />
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        appointment={confirmationData}
        onClose={() => {
          setShowConfirmation(false);
          setConfirmationData(null);
        }}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}
    </>
  );
}

export default Home;
