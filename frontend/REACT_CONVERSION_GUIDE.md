# React Conversion Guide

This document explains the conversion from vanilla HTML/CSS/JS to React.

## Key Changes

### 1. **Component Structure**
- **HTML files** → **React Components**
  - `index.html` → `pages/Home.js` (Home page)
  - `admin.html` → `pages/AdminDashboard.js` (Admin page)
  - Common elements → Reusable components

- **New Components Created:**
  - `Header.js` - Navigation bar
  - `Footer.js` - Footer section
  - `AppointmentForm.js` - Form for booking
  - `TimeSlots.js` - Time slot selection
  - `RecentAppointments.js` - Recent appointments list
  - `ConfirmationModal.js` - Booking confirmation
  - `Notification.js` - Toast notifications

### 2. **State Management**
- Replaced DOM queries with React state (`useState` hook)
- Event listeners → React event handlers (`onChange`, `onClick`)
- Manual DOM updates → State updates trigger re-renders

### 3. **Routing**
- Added `react-router-dom` for navigation
- Navigation between pages without full page reload
- `<Link>` components replace `<a>` tags

### 4. **Styling**
- Global styles in `index.css`
- Component-specific CSS modules in `src/styles/` folder
- CSS variables for consistent theming
- Responsive design maintained

### 5. **API Integration**
- Kept the same API endpoints
- Used `fetch` API for HTTP requests
- Organized API calls in components using `useEffect` hook

## Before (Vanilla JS)
```javascript
// Old way - Direct DOM manipulation
const appointmentForm = document.getElementById('appointmentForm');
appointmentForm.addEventListener('submit', handleAppointmentBooking);

function handleAppointmentBooking(e) {
    e.preventDefault();
    const formData = {
        patientName: document.getElementById('patientName').value,
        // ... more fields
    };
    // ... submit logic
}
```

## After (React)
```javascript
// New way - React state and hooks
function AppointmentForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        patientName: '',
        // ... more fields
    });

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

    return (
        <form onSubmit={handleSubmit}>
            <input
                id="patientName"
                value={formData.patientName}
                onChange={handleChange}
            />
            {/* ... more fields */}
        </form>
    );
}
```

## Advantages of React Version

1. **Component Reusability** - Components can be easily reused
2. **Better State Management** - Organized and predictable state handling
3. **Cleaner Code** - No direct DOM manipulation
4. **Performance** - React optimizes re-renders
5. **Maintainability** - Easier to understand and modify
6. **Scalability** - Can easily add new features

## Migration Notes

- Old `script.js` logic has been distributed across components
- Global notification system converted to component-based notifications
- Modal functionality now uses React state instead of CSS display
- Time slot loading and rendering is component-based
- Form validation remains the same

## Running the React App

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Build for production: `npm build`

The React version maintains all functionality while providing a more maintainable and scalable codebase.
