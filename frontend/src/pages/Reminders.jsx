// import { useState, useEffect } from 'react';
// import api from '../utils/api';
// import Navbar from '../components/layout/Navbar';
// import toast from 'react-hot-toast';

// function Reminders() {
//     const [reminders, setReminders] = useState([]);
//     const [applications, setApplications] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     const [form, setForm] = useState({
//         application_id: '',
//         reminder_date: '',
//         message: ''
//     });

//     useEffect(() => {
//         fetchAll();
//     }, []);

//     const fetchAll = async () => {
//         try {
//             const [remindersRes, appsRes] = await Promise.all([
//                 api.get('/api/reminders'),
//                 api.get('/api/applications')
//             ]);
//             setReminders(remindersRes.data.reminders);
//             setApplications(appsRes.data.applications);
//         } catch (err) {
//             toast.error('Failed to fetch data');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!form.application_id || !form.reminder_date || !form.message) {
//             toast.error('All fields are required');
//             return;
//         }
//         setSubmitting(true);
//         try {
//             const res = await api.post('/api/reminders', form);
//             setReminders([...reminders, {
//                 ...res.data.reminder,
//                 company: applications.find(a => a.id === parseInt(form.application_id))?.company,
//                 role: applications.find(a => a.id === parseInt(form.application_id))?.role
//             }]);
//             setForm({ application_id: '', reminder_date: '', message: '' });
//             setShowForm(false);
//             toast.success('Reminder added!');
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to add reminder');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const formatDate = (dateStr) => {
//         return new Date(dateStr).toLocaleString('en-IN', {
//             day: '2-digit', month: 'short', year: 'numeric',
//             hour: '2-digit', minute: '2-digit'
//         });
//     };

//     if (loading) return <div className="loading">Loading...</div>;

//     return (
//         <div>
//             <Navbar />
//             <div className="reminders-container">
//                 <div className="reminders-header">
//                     <h1>Reminders</h1>
//                     <button
//                         className="btn btn-primary"
//                         onClick={() => setShowForm(!showForm)}
//                     >
//                         {showForm ? 'Cancel' : '+ Add Reminder'}
//                     </button>
//                 </div>

//                 {/* Add Reminder Form */}
//                 {showForm && (
//                     <div className="reminder-form-card">
//                         <h2>New Reminder</h2>
//                         <div className="reminder-form">

//                             <div className="form-group">
//                                 <label>Application</label>
//                                 <select
//                                     name="application_id"
//                                     value={form.application_id}
//                                     onChange={handleChange}
//                                 >
//                                     <option value="">Select an application</option>
//                                     {applications.map(app => (
//                                         <option key={app.id} value={app.id}>
//                                             {app.company} — {app.role}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Reminder Date & Time</label>
//                                 <input
//                                     type="datetime-local"
//                                     name="reminder_date"
//                                     value={form.reminder_date}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Message</label>
//                                 <textarea
//                                     name="message"
//                                     value={form.message}
//                                     onChange={handleChange}
//                                     rows={3}
//                                     placeholder="e.g. Prepare for system design round"
//                                 />
//                             </div>

//                             <button
//                                 className="btn btn-primary"
//                                 onClick={handleSubmit}
//                                 disabled={submitting}
//                             >
//                                 {submitting ? 'Adding...' : 'Add Reminder'}
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Reminders List */}
//                 {reminders.length === 0 ? (
//                     <div className="empty-state">
//                         <p>No reminders yet. Add one to get email alerts before interviews!</p>
//                     </div>
//                 ) : (
//                     <div className="reminders-list">
//                         {reminders.map(reminder => (
//                             <div
//                                 key={reminder.id}
//                                 className={`reminder-card ${reminder.sent ? 'reminder-sent' : 'reminder-pending'}`}
//                             >
//                                 <div className="reminder-info">
//                                     <h3>{reminder.company} — {reminder.role}</h3>
//                                     <p className="reminder-message">{reminder.message}</p>
//                                     <p className="reminder-date">🕐 {formatDate(reminder.reminder_date)}</p>
//                                 </div>
//                                 <div className="reminder-status">
//                                     <span className={`status-badge ${reminder.sent ? 'badge-sent' : 'badge-pending'}`}>
//                                         {reminder.sent ? '✅ Sent' : '⏳ Pending'}
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Reminders;

{reminders.map(reminder => {
    const now = new Date();
    const reminderDate = new Date(reminder.reminder_date);
    const hoursUntil = (reminderDate - now) / (1000 * 60 * 60);
    const isDueSoon = !reminder.sent && hoursUntil <= 24 && hoursUntil > 0;

    return (
        <div
            key={reminder.id}
            className={`reminder-card ${
                reminder.sent
                    ? 'reminder-sent'
                    : isDueSoon
                    ? 'border-l-red-400'  // due within 24hrs
                    : 'reminder-pending'
            }`}
        >
            <div className="reminder-info">
                <h3>{reminder.company} — {reminder.role}</h3>
                <p className="reminder-message">{reminder.message}</p>
                <p className="reminder-date">🕐 {formatDate(reminder.reminder_date)}</p>
                {isDueSoon && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                        ⚠️ Due in less than 24 hours
                    </p>
                )}
            </div>
            <div className="reminder-status">
                <span className={`status-badge ${
                    reminder.sent
                        ? 'badge-sent'
                        : isDueSoon
                        ? 'bg-red-100 text-red-600 badge'
                        : 'badge-pending'
                }`}>
                    {reminder.sent ? '✅ Sent' : isDueSoon ? '🔔 Due Soon' : '⏳ Pending'}
                </span>
            </div>
        </div>
    );
})}