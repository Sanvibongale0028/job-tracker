const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const { sendReminders } = require('./controllers/reminderController');
const resumeRoutes = require('./routes/resumeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/resume', resumeRoutes);

setInterval(sendReminders, 5 * 60 * 1000);

app.get('/test-reminders', async (req, res) => {
  await sendReminders();
  res.json({ message: 'Reminders checked!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
