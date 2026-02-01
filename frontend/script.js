const API_BASE_URL = "http://localhost:3000/api";

// DOM Elements
const appointmentForm = document.getElementById('appointmentForm');
const timeSlotsContainer = document.getElementById('timeSlots');
const recentAppointmentsContainer = document.getElementById('recentAppointments');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationDetails = document.getElementById('confirmationDetails');
const closeModal = document.querySelector('.close-modal');
const printBtn = document.getElementById('printBtn');
const newBookingBtn = document.getElementById('newBookingBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadTimeSlots();
    loadRecentAppointments();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Event Listeners
    appointmentForm.addEventListener('submit', handleAppointmentBooking);
    closeModal.addEventListener('click', () => confirmationModal.style.display = 'none');
    printBtn.addEventListener('click', printConfirmation);
    newBookingBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
        appointmentForm.reset();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Update time slots when date changes
    document.getElementById('appointmentDate').addEventListener('change', loadTimeSlots);
});

// Load available time slots
async function loadTimeSlots() {
    try {
        const date = document.getElementById('appointmentDate').value || new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/appointments/available-slots?date=${date}`);
        const data = await response.json();
        
        if (response.ok) {
            renderTimeSlots(data.availableSlots);
        } else {
            showNotification('Error loading time slots', 'error');
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
        showNotification('Error loading time slots', 'error');
    }
}

// Render time slots
function renderTimeSlots(slots) {
    timeSlotsContainer.innerHTML = '';
    
    const allSlots = [
        '09:00', '10:00', '11:00', 
        '12:00', '14:00', '15:00', 
        '16:00', '17:00'
    ];
    
    allSlots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        
        if (slots.includes(slot)) {
            slotElement.textContent = formatTime(slot);
            slotElement.addEventListener('click', () => selectTimeSlot(slot));
        } else {
            slotElement.textContent = formatTime(slot);
            slotElement.classList.add('booked');
            slotElement.title = 'This slot is already booked';
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

// Select time slot
function selectTimeSlot(time) {
    // Remove selected class from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selected class to clicked slot
    const selectedSlot = Array.from(document.querySelectorAll('.time-slot')).find(
        slot => slot.textContent === formatTime(time)
    );
    
    if (selectedSlot && !selectedSlot.classList.contains('booked')) {
        selectedSlot.classList.add('selected');
        document.getElementById('appointmentTime').value = time;
    }
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
}

// Load recent appointments
async function loadRecentAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/recent`);
        const data = await response.json();
        
        if (response.ok) {
            renderRecentAppointments(data);
        }
    } catch (error) {
        console.error('Error loading recent appointments:', error);
    }
}

// Render recent appointments
function renderRecentAppointments(appointments) {
    recentAppointmentsContainer.innerHTML = '';
    
    if (appointments.length === 0) {
        recentAppointmentsContainer.innerHTML = '<p>No recent appointments</p>';
        return;
    }
    
    appointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        
        appointmentElement.innerHTML = `
            <h5>${appointment.patientName}</h5>
            <p><i class="far fa-calendar"></i> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><i class="far fa-clock"></i> ${formatTime(appointment.time)}</p>
            <p><i class="fas fa-stethoscope"></i> ${appointment.service}</p>
        `;
        
        recentAppointmentsContainer.appendChild(appointmentElement);
    });
}

// Handle appointment booking
async function handleAppointmentBooking(e) {
    e.preventDefault();
    
    const appointmentData = {
        patientName: document.getElementById('patientName').value,
        patientEmail: document.getElementById('patientEmail').value,
        patientPhone: document.getElementById('patientPhone').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        service: document.getElementById('serviceType').value,
        notes: document.getElementById('notes').value,
        status: 'confirmed'
    };
    
    // Validation
    if (!appointmentData.time) {
        showNotification('Please select a time slot', 'warning');
        return;
    }
    
    try {
        // Check slot availability
        const availabilityResponse = await fetch(
            `${API_BASE_URL}/appointments/check-availability?date=${appointmentData.date}&time=${appointmentData.time}`
        );
        const availabilityData = await availabilityResponse.json();
        
        if (!availabilityData.available) {
            showNotification('This time slot is no longer available. Please select another slot.', 'error');
            loadTimeSlots();
            return;
        }
        
        // Book appointment
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showConfirmation(data);
            loadTimeSlots();
            loadRecentAppointments();
            showNotification('Appointment booked successfully!', 'success');
        } else {
            showNotification(data.error || 'Error booking appointment', 'error');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        showNotification('Error booking appointment. Please try again.', 'error');
    }
}

// Show confirmation modal
function showConfirmation(appointment) {
    confirmationDetails.innerHTML = `
        <div class="confirmation-details">
            <p><strong>Appointment ID:</strong> ${appointment._id}</p>
            <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Status:</strong> <span class="status confirmed">Confirmed</span></p>
        </div>
    `;
    
    confirmationModal.style.display = 'block';
}

// Print confirmation
function printConfirmation() {
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
                ${confirmationDetails.innerHTML}
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
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Admin Dashboard functions (if on admin page)
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadDashboardStats();
        loadAllAppointments();
    });
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/stats`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('totalAppointments').textContent = data.total;
            document.getElementById('confirmedAppointments').textContent = data.confirmed;
            document.getElementById('pendingAppointments').textContent = data.pending;
            document.getElementById('cancelledAppointments').textContent = data.cancelled;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load all appointments for admin
async function loadAllAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        const data = await response.json();
        
        if (response.ok) {
            renderAllAppointments(data);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Render all appointments in admin table
function renderAllAppointments(appointments) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${appointment._id.substring(0, 8)}...</td>
            <td>${appointment.patientName}</td>
            <td>${appointment.patientEmail}</td>
            <td>${new Date(appointment.date).toLocaleDateString()}</td>
            <td>${formatTime(appointment.time)}</td>
            <td>${appointment.service}</td>
            <td><span class="status ${appointment.status}">${appointment.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editAppointment('${appointment._id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteAppointment('${appointment._id}')">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Edit appointment (admin only)
async function editAppointment(id) {
    // Implement edit functionality
    showNotification('Edit functionality coming soon!', 'info');
}

// Delete appointment (admin only)
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
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
}