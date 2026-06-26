// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// function Login() {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await api.post('/api/auth/login', formData);
//       login(res.data.user, res.data.token);
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">

//         {/* App name */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-blue-600">Job Tracker</h1>
//           <p className="text-slate-500 text-sm mt-1">Track your journey to the perfect role</p>
//         </div>

//         <h2 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h2>
//         <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               placeholder="••••••••"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="btn btn-primary w-full justify-center py-2.5 mt-1"
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <p className="text-center text-sm text-slate-500 mt-6">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-blue-600 hover:underline font-medium">
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', formData);
            login(res.data.user, res.data.token);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-600">Job Tracker</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your journey to the perfect role</p>
                </div>

                <h2 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full justify-center py-2.5 mt-1"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;