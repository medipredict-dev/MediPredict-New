import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getDashboardByRole = (roles) => {
        if (!roles || roles.length === 0) return '/dashboard';
        const roleNames = roles.map(r => r.name || r);
        if (roleNames.includes('Admin')) return '/dashboard';
        if (roleNames.includes('Coach')) return '/coach-dashboard';
        if (roleNames.includes('Medical')) return '/medical-dashboard';
        if (roleNames.includes('Player')) return '/dashboard';
        return '/dashboard';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));

                if (response.data.needsProfile) {
                    navigate('/complete-profile');
                } else {
                    const dashboard = getDashboardByRole(response.data.roles);
                    navigate(dashboard);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-page">
            {/* Left Panel - Holographic */}
            <div className="login-left">
                <div className="login-left-logo">
                    <Activity className="brand-icon" size={24} />
                    <span className="brand-text">
                        Medi<span className="brand-highlight">Predict</span>
                    </span>
                </div>

                <div className="login-left-content">
                    <h1 className="login-left-title">
                        Welcome Back.<br />
                        <span className="highlight">Let's Continue.</span>
                    </h1>
                    <p className="login-left-subtitle">
                        Access your personalized recovery timelines, team analytics, and AI-powered insights.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="login-right">
                <div className="login-form-wrapper">
                    <Link to="/" className="login-back-link">
                        <ArrowLeft size={16} />
                        Back to website
                    </Link>

                    <h2 className="login-heading">Sign in to your account</h2>
                    <p className="login-subtext">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>

                    {error && <p className="login-error">{error}</p>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label>Password</label>
                            <div className="login-password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit">
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
