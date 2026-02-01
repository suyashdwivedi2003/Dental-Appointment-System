import React, { useState, useEffect } from 'react';
import '../styles/TimeSlots.css';

function TimeSlots({ selectedDate, onSelectTime, onLoadSlots }) {
  const [slots, setSlots] = useState(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    loadTimeSlots();
  }, [selectedDate]);

  const loadTimeSlots = async () => {
    try {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:3000/api/appointments/available-slots?date=${date}`);
      const data = await response.json();
      
      if (response.ok) {
        setSlots(data.availableSlots || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const allSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const handleSelectSlot = (slot) => {
    if (slots.includes(slot)) {
      setSelectedTime(slot);
      onSelectTime(slot);
    }
  };

  return (
    <div className="availability-section">
      <h3><i className="fas fa-calendar-check"></i> Today's Availability</h3>
      <div className="time-slots">
        {allSlots.map(slot => (
          <div
            key={slot}
            className={`time-slot ${!slots.includes(slot) ? 'booked' : ''} ${selectedTime === slot ? 'selected' : ''}`}
            onClick={() => handleSelectSlot(slot)}
            title={!slots.includes(slot) ? 'This slot is already booked' : ''}
          >
            {formatTime(slot)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeSlots;
