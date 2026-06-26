import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const statusClass = {
  'Applied': 'badge badge-applied',
  'Interview Scheduled': 'badge badge-interview',
  'Offer Received': 'badge badge-offered',
  'Rejected': 'badge badge-rejected',
};

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [formData, setFormData] = useState({
    company: '', role: '', status: 'Applied', date_applied: '', notes: ''
  });

  useEffect(() => { fetchApplications(); }, [search, statusFilter, sortBy, order]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);
      const res = await api.get(`/api/applications?${params}`);
      setApplications(res.data.applications);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editApp) {
        await api.put(`/api/applications/${editApp.id}`, formData);
        toast.success('Application updated!');
      } else {
        await api.post('/api/applications', formData);
        toast.success('Application added!');
      }
      setShowForm(false);
      setEditApp(null);
      setFormData({ company: '', role: '', status: 'Applied', date_applied: '', notes: '' });
      fetchApplications();
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (app) => {
    setEditApp(app);
    setFormData({
      company: app.company, role: app.role, status: app.status,
      date_applied: app.date_applied.split('T')[0], notes: app.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/api/applications/${id}`);
      toast.success('Deleted!');
      fetchApplications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleExport = (type) => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/api/export/${type}?token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <Navbar />
      <div className="applications-container">

        {/* Header */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export buttons */}
            <button
              onClick={() => handleExport('excel')}
              className="btn btn-secondary flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-secondary flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export PDF
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(true); setEditApp(null); }}
            >
              + Add
            </button>
          </div>
        </div>
        {/* <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditApp(null); }}>
            + Add
          </button>
        </div> */}

        {/* Filters — wraps on mobile */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer Received">Offer Received</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Date Added</option>
            <option value="date_applied">Date Applied</option>
            <option value="company">Company</option>
            <option value="status">Status</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border-l-4 border-l-blue-600">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {editApp ? 'Edit Application' : 'Add Application'}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text" name="company" placeholder="Company Name"
                  value={formData.company} onChange={handleChange} required
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text" name="role" placeholder="Role"
                  value={formData.role} onChange={handleChange} required
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer Received">Offer Received</option>
                </select>
                <input
                  type="date" name="date_applied"
                  value={formData.date_applied} onChange={handleChange} required
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="notes" placeholder="Notes (optional)"
                  value={formData.notes} onChange={handleChange} rows={3}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editApp ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => { setShowForm(false); setEditApp(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* overflow-x-auto for mobile table scroll */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{app.company}</td>
                      <td className="px-4 py-3 text-slate-600">{app.role}</td>
                      <td className="px-4 py-3">
                        <span className={statusClass[app.status] || 'badge badge-applied'}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(app.date_applied).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">
                        {app.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {/* ✅ buttons side by side, never overflow */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {applications.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400 text-sm">
                No applications found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;