import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    const links = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/applications', label: 'Applications' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/resume', label: 'Resume' },
        { to: '/reminders', label: 'Reminders' },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Brand */}
                <Link to="/dashboard" className="text-blue-600 font-bold text-lg tracking-tight">
                    Job Tracker
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-6">
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`text-sm font-medium transition-colors no-underline ${
                                location.pathname === link.to
                                    ? 'text-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop user */}
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-slate-500 text-sm">Hi, {user?.name}!</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-slate-600 focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-3">
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className={`text-sm font-medium py-1 no-underline ${
                                location.pathname === link.to
                                    ? 'text-blue-600'
                                    : 'text-slate-600'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Hi, {user?.name}!</span>
                        <button onClick={handleLogout} className="text-sm text-red-500 font-medium">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;