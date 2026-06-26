import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const statusClass = {
    'Applied': 'badge badge-applied',
    'Interview Scheduled': 'badge badge-interview',
    'Offer Received': 'badge badge-offered',
    'Rejected': 'badge badge-rejected',
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [statsRes, appsRes] = await Promise.all([
                api.get('/api/applications/stats'),
                api.get('/api/applications')
            ]);
            setStats(statsRes.data.stats);
            setApplications(appsRes.data.applications);
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <h1>Dashboard</h1>

                {/* Stats Cards */}
                <div className="stats-grid">
                    {[
                        { label: 'Total', value: stats?.total },
                        { label: 'Applied', value: stats?.applied },
                        { label: 'Interviews', value: stats?.interviews },
                        { label: 'Rejected', value: stats?.rejected },
                        { label: 'Offers', value: stats?.offers },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <h3>{s.label}</h3>
                            <p>{s.value || 0}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-700">Recent Applications</h2>
                        <Link to="/applications" className="text-sm text-blue-600 hover:underline font-medium">
                            View All
                        </Link>
                    </div>

                    {/* ✅ overflow-x-auto wraps the table for mobile scroll */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.slice(0, 5).map(app => (
                                    <tr key={app.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50">
                                        <td className="px-4 py-3 text-slate-700 font-medium">{app.company}</td>
                                        <td className="px-4 py-3 text-slate-600">{app.role}</td>
                                        <td className="px-4 py-3">
                                            <span className={statusClass[app.status] || 'badge badge-applied'}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {new Date(app.date_applied).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {applications.length === 0 && (
                        <p className="px-6 py-8 text-center text-slate-400 text-sm">
                            No applications yet. <Link to="/applications" className="text-blue-600 hover:underline">Add one!</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;