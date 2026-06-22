import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register()  {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) =>  {
        e.preventDefault();
        setLoading(true);

        try  {
            const res = await api.post('/api/auth/register', formData);
            login(res.data.user, res.data.token);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        }  catch(err)  {
            toast.error(err.response?.data?.message || 'Something went wrong');
        }  finally  {
            setLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <form onSubmit={handleSubmit} className='auth-form'>
                <h2>Create Account</h2>

                <input 
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input 
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>

                <p>Already have an account? <Link to='/login'>Login</Link></p>

            </form>
        </div>
    );
}

export default Register;