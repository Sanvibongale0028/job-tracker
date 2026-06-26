import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

// converts count strings → numbers
const toNumber = (arr, key = 'count') =>
    arr?.map(item => ({ ...item, [key]: Number(item[key]) })) || [];

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, statsRes] = await Promise.all([
                api.get('/api/applications/analytics'),
                api.get('/api/applications/stats')
            ]);

            // confirms whether count is string or number in your console
            console.log('count type:', typeof analyticsRes.data.statusBreakdown[0]?.count);

            setAnalytics(analyticsRes.data);
            setStats(statsRes.data.stats);
        } catch (err) {
            toast.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className="analytics-container">
                <h1>Analytics</h1>

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

                <div className="charts-grid">

                    {/* Pie Chart - Status Breakdown */}
                    <div className="chart-card" style={{ height: '360px' }}>
                        <h2>Status Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={toNumber(analytics?.statusBreakdown)}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {toNumber(analytics?.statusBreakdown).map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card" style={{ height: '360px' }}>
                        <h2>Top Companies</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={toNumber(analytics?.topCompanies)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="company" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Line Chart - Monthly Trend */}
                    <div className="chart-card" style={{ height: '360px' }}>
                        <h2>Monthly Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={toNumber(analytics?.monthlyTrend)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Analytics;