import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <i className="fas fa-tooth"></i>
        <h1>Smile Dental Clinic</h1>
      </div>
      <nav className="nav">
        <Link to="/" className="nav-link active">Book Appointment</Link>
        <Link to="/admin" className="nav-link">Admin Dashboard</Link>
      </nav>
    </header>
  );
}

export default Header;
