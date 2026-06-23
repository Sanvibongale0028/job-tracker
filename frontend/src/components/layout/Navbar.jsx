import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar()  {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () =>  {
        logout();
        toast.success('Logged out successfully!');
        navigate('./login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">Dashboard</Link>
            </div>

            <div className='navbar-links'>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/applications">Applications</Link>
                <Link to="/analytics">Analytics</Link>
                <Link to="/resume">Resume</Link>
            </div>

            <div className="navbar-user">
                <span>Hi, {user?.name}!</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    )
}

export default Navbar;