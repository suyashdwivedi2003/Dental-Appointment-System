const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = 3000;
// console.log("hello");
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
const key="mongodb+srv://sundram:backend3691@cluster0.v6spjqo.mongodb.net/productivityDB?retryWrites=true&w=majority";
// console.log(key);
mongoose.connect(key, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`MongoDB connected`);
});
