import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

function Dashboard()  {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try  {
            const [statsRes, appsRes] = await Promise.all([
                api.get('/api/applications/stats'),
                api.get('/api/applications')
            ]);
            setStats(statsRes.data.stats);
            setApplications(appsRes.data.applications);
        } catch (err)  {
            toast.error('Failed to fetch data');
        } finally  {
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
                    <div className="stat-card">
                        <h3>Total</h3>
                        <p>{stats?.total || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Applied</h3>
                        <p>{stats?.applied || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Interviews</h3>
                        <p>{stats?.interviews || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Rejected</h3>
                        <p>{stats?.rejected || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Offers</h3>
                        <p>{stats?.offers || 0}</p>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="recent-applications">
                    <div className="section-header">
                        <h2>Recent Applications</h2>
                        <Link to="/applications">View All</Link>
                    </div>

                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Date Applied</th>
                            </tr>
                        </thead>

                        <tbody>
                            {applications.slice(0, 5).map(app => (
                                <tr key={app.id}>
                                    <td>{app.company}</td>
                                    <td>{app.role}</td>
                                    <td>
                                        <span className={`status-badges ${app.status.toLowerCase().replace(' ', '-')}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>{new Date(app.date_applied).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {applications.length === 0 && (
                        <p className="no-data">No applications yet. <Link to="/applications">Add one!</Link></p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;