import React, { useState, useEffect } from 'react';
import '../styles/RecentAppointments.css';

function RecentAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadRecentAppointments();
  }, []);

  const loadRecentAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/appointments/recent');
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading recent appointments:', error);
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="availability-section">
      <h3><i className="fas fa-list-check"></i> Recent Appointments</h3>
      <div className="appointment-list">
        {appointments.length === 0 ? (
          <p>No recent appointments</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-item">
              <h5>{appointment.patientName}</h5>
              <p><i className="far fa-calendar"></i> {new Date(appointment.date).toLocaleDateString()}</p>
              <p><i className="far fa-clock"></i> {formatTime(appointment.time)}</p>
              <p><i className="fas fa-stethoscope"></i> {appointment.service}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentAppointments;
