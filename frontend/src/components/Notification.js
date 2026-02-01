import React from 'react';
import '../styles/Notification.css';

function Notification({ message, type = 'info', onClose }) {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  return (
    <div className={`notification ${type}`}>
      <i className={icons[type]}></i>
      <span>{message}</span>
    </div>
  );
}

export default Notification;
