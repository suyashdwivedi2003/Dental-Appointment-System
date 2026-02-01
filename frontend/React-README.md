# Dental Clinic Appointment System - React Frontend

This is the React version of the Dental Clinic Appointment System frontend.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd dental-appointment-system/frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html           # Main HTML file
├── src/
│   ├── components/
│   │   ├── Header.js        # Navigation header
│   │   ├── Footer.js        # Footer component
│   │   ├── AppointmentForm.js    # Appointment booking form
│   │   ├── TimeSlots.js     # Time slot selection
│   │   ├── RecentAppointments.js # Recent appointments list
│   │   ├── ConfirmationModal.js  # Booking confirmation modal
│   │   └── Notification.js  # Notification component
│   ├── pages/
│   │   ├── Home.js          # Main appointment booking page
│   │   └── AdminDashboard.js    # Admin dashboard page
│   ├── styles/
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   ├── AppointmentForm.css
│   │   ├── TimeSlots.css
│   │   ├── RecentAppointments.css
│   │   ├── Modal.css
│   │   ├── Notification.css
│   │   ├── Home.css
│   │   └── AdminDashboard.css
│   ├── App.js               # Main app component with routing
│   ├── App.css              # Global styles
│   ├── index.js             # Entry point
│   └── index.css            # Global CSS variables and base styles
└── package.json             # Project dependencies
```

## Features

### User Pages
- **Book Appointment**: Users can book dental appointments with:
  - Patient information (name, email, phone)
  - Appointment date and time selection
  - Service type selection
  - Additional notes/concerns
  - Real-time time slot availability
  - Confirmation modal with print option

- **Recent Appointments**: View recently booked appointments

### Admin Dashboard
- **Statistics**: View total, confirmed, pending, and cancelled appointments
- **Appointment Management**: 
  - View all appointments in a table
  - Edit appointments (coming soon)
  - Delete appointments
  - Filter by status

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/`

### Endpoints Used
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/recent` - Get recent appointments
- `GET /api/appointments/stats` - Get dashboard statistics
- `GET /api/appointments/available-slots?date=YYYY-MM-DD` - Get available time slots
- `GET /api/appointments/check-availability` - Check if a slot is available
- `POST /api/appointments` - Book a new appointment
- `DELETE /api/appointments/:id` - Delete an appointment

## Technologies Used

- **React** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client (optional, using fetch API)
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Styling

The application uses:
- CSS custom properties (variables) for consistent theming
- CSS Grid for layouts
- Responsive design with media queries
- Smooth animations and transitions

### Color Scheme
- Primary: #2a9d8f (Teal)
- Secondary: #264653 (Dark Blue)
- Accent: #e9c46a (Yellow)
- Danger: #e76f51 (Red/Orange)
- Light: #f8f9fa (Light Gray)

## Notes

- The application assumes the backend is running on `http://localhost:3000`
- To use the admin dashboard, ensure proper backend authentication is implemented
- For deployment, update the `API_BASE_URL` in the components to match your backend URL
