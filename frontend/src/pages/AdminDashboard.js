import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import Notification from '../components/Notification';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadDashboardStats();
    loadAllAppointments();
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/appointments/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      showNotification('Error loading statistics', 'error');
    }
  };

  const loadAllAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/appointments');
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      showNotification('Error loading appointments', 'error');
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Appointment deleted successfully!', 'success');
        loadDashboardStats();
        loadAllAppointments();
      } else {
        showNotification('Error deleting appointment', 'error');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showNotification('Error deleting appointment', 'error');
    }
  };

  const handleEditAppointment = (id) => {
    showNotification('Edit functionality coming soon!', 'info');
  };

  return (
    <>
      <div className="hero">
        <h2>Appointment Management System</h2>
        <p>Manage all appointments and view statistics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-calendar-check"></i>
          <h3>{stats.total}</h3>
          <p>Total Appointments</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <h3>{stats.confirmed}</h3>
          <p>Confirmed</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-clock"></i>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-times-circle"></i>
          <h3>{stats.cancelled}</h3>
          <p>Cancelled</p>
        </div>
      </div>

      <div className="table-container">
        <h3><i className="fas fa-list"></i> All Appointments</h3>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment._id}>
                <td>{appointment._id.substring(0, 8)}...</td>
                <td>{appointment.patientName}</td>
                <td>{appointment.patientEmail}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{formatTime(appointment.time)}</td>
                <td>{appointment.service}</td>
                <td>
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => handleEditAppointment(appointment._id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDeleteAppointment(appointment._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
        />
      )}
    </>
  );
}

export default AdminDashboard;
