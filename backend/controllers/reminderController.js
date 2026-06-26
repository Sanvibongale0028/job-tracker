const pool = require('../config/db');
const transporter = require('../config/email');
require('dotenv').config();

const addReminder = async (req, res) => {
  const { application_id, reminder_date, message } = req.body;

  try {
    const application = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [application_id, req.user.id]
    );

    if (application.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const newReminder = await pool.query(
      'INSERT INTO reminders (application_id, reminder_date, message) VALUES ($1, $2, $3) RETURNING *',
      [application_id, reminder_date, message]
    );

    res.status(201).json({
      message: 'Reminder added successfully.',
      reminder: newReminder.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const sendReminders = async () => {
  try {
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    console.log('Checking reminders between:', now, 'and', tenMinutesLater);

    const reminders = await pool.query(
      `SELECT r.*, a.company, a.role, u.email, u.name
       FROM reminders r
       JOIN applications a ON r.application_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE r.reminder_date BETWEEN $1 AND $2
       AND r.sent = false`,
      [now, tenMinutesLater]
    );

    console.log('Reminders found:', reminders.rows.length);

    for (const reminder of reminders.rows) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: reminder.email,
        subject: `Reminder - ${reminder.company} - ${reminder.role}`,
        html: `
          <h2>Interview Reminder</h2>
          <p>Hi ${reminder.name},</p>
          <p>${reminder.message}</p>
          <p><strong>Company:</strong> ${reminder.company}</p>
          <p><strong>Role:</strong> ${reminder.role}</p>
          <p><strong>Reminder Time:</strong> ${reminder.reminder_date}</p>
          <p>Best of luck with your interview!</p>
        `
      });

      await pool.query(
        'UPDATE reminders SET sent = true WHERE id = $1',
        [reminder.id]
      );

      console.log(`Reminder sent to ${reminder.email}`);
    }

  } catch (err) {
    console.error('Error sending reminders:', err.message);
  }
};

// const getReminders = async (req, res) => {
//     try {
//         const reminders = await pool.query(
//             `SELECT r.*, a.company, a.role 
//              FROM reminders r
//              JOIN applications a ON r.application_id = a.id
//              WHERE a.user_id = $1
//              ORDER BY r.reminder_date ASC`,
//             [req.user.id]
//         );
//         res.status(200).json({ reminders: reminders.rows });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error.', error: err.message });
//     }
// };

const getReminders = async (req, res) => {
  try {
    // ✅ auto-delete reminders whose date has passed and were never sent
    await pool.query(
      `DELETE FROM reminders 
             WHERE reminder_date < NOW() 
             AND sent = false
             AND application_id IN (
                SELECT id FROM applications WHERE user_id = $1
             )`,
      [req.user.id]
    );

    const reminders = await pool.query(
      `SELECT r.*, a.company, a.role 
             FROM reminders r
             JOIN applications a ON r.application_id = a.id
             WHERE a.user_id = $1
             ORDER BY r.reminder_date ASC`,
      [req.user.id]
    );

    res.status(200).json({ reminders: reminders.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { addReminder, sendReminders, getReminders };