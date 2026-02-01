import React from 'react';
import '../styles/Modal.css';

function ConfirmationModal({ isOpen, appointment, onClose }) {
  if (!isOpen || !appointment) return null;

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handlePrint = () => {
    const printContent = `
      <html>
      <head>
        <title>Appointment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin: 20px 0; }
          .details p { margin: 10px 0; }
          .footer { margin-top: 50px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Smile Dental Clinic</h2>
          <h3>Appointment Confirmation</h3>
        </div>
        <div class="details">
          <p><strong>Appointment ID:</strong> ${appointment._id}</p>
          <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
          <p><strong>Status:</strong> <span>Confirmed</span></p>
        </div>
        <div class="footer">
          <p>Thank you for choosing Smile Dental Clinic!</p>
          <p>Please arrive 10 minutes before your appointment time.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2 style={{ marginBottom: '20px' }}>Appointment Confirmation</h2>
        <div className="confirmation-details">
          <p><strong>Appointment ID:</strong> {appointment._id}</p>
          <p><strong>Patient Name:</strong> {appointment.patientName}</p>
          <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {formatTime(appointment.time)}</p>
          <p><strong>Service:</strong> {appointment.service}</p>
          <p><strong>Status:</strong> <span className="status confirmed">Confirmed</span></p>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print
          </button>
          <button className="btn-secondary" onClick={onClose}>
            <i className="fas fa-check"></i> Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
