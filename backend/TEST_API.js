// Simple API Test Script
// Copy and paste commands in your terminal to test the API

// 1. Test if server is running
// curl http://localhost:3000/health

// 2. Get all patients
// curl http://localhost:3000/api/patients

// 3. Get all appointments
// curl http://localhost:3000/api/appointments

// 4. Get recent appointments
// curl http://localhost:3000/api/appointments/recent

// 5. Get appointment stats
// curl http://localhost:3000/api/appointments/stats

// 6. Create a test appointment (using PowerShell)
/*
$body = @{
    patientName = "John Doe"
    patientEmail = "john@example.com"
    patientPhone = "1234567890"
    date = "2026-02-15"
    time = "10:00"
    service = "cleaning"
    notes = "First time patient"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
*/

// 7. Search patients
// curl http://localhost:3000/api/patients/search/john

// 8. Get patient by ID (replace with actual ID)
// curl http://localhost:3000/api/patients/507f1f77bcf86cd799439011

console.log('Test API endpoints by running the curl/PowerShell commands above');
console.log('Replace IDs with actual MongoDB ObjectIds from your database');
