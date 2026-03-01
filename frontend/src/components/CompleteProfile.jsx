import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import './CompleteProfile.css';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        age: '',
        playingRole: 'Batsman',
        experienceYears: '',
        height: '',
        weight: '',
        pastInjuries: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }

        const user = JSON.parse(userStr);
        const isPlayer = Array.isArray(user.roles)
            ? user.roles.some(r => r.name === 'Player' || r === 'Player')
            : user.role === 'Player';

        if (!isPlayer) {
            setError('Only players need to complete a profile.');
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);

        try {
            const injuriesArray = formData.pastInjuries
                ? formData.pastInjuries.split(',').map(i => i.trim())
                : [];

            await axios.post(
                'http://localhost:5000/api/player-profile',
                { ...formData, pastInjuries: injuriesArray },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const updatedUser = { ...user, needsProfile: false };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cp-page">
            {/* Navbar */}
            <nav className="cp-nav">
                <div className="cp-nav-brand">
                    <Activity size={22} className="cp-brand-icon" />
                    <span className="cp-brand-text">
                        Medi<span className="cp-brand-highlight">Predict</span>
                    </span>
                </div>
                <Link to="/dashboard" className="cp-back-link">
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>
            </nav>

            <main className="cp-main">
                <div className="cp-card">
                    {/* Header */}
                    <p className="cp-card-eyebrow">Player Onboarding</p>
                    <h1 className="cp-card-title">Complete Your Profile</h1>
                    <p className="cp-card-subtitle">
                        We need this information to generate accurate injury predictions
                        and personalised recovery timelines.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="cp-error">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="cp-form">

                        {/* ── Core Info ── */}
                        <div className="cp-row">
                            <div className="cp-field">
                                <label>Age <span>*</span></label>
                                <input
                                    type="number"
                                    name="age"
                                    className="cp-input"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="e.g. 24"
                                    min="10"
                                    required
                                />
                            </div>
                            <div className="cp-field">
                                <label>Experience (Years) <span>*</span></label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    className="cp-input"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder="e.g. 5"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="cp-field">
                            <label>Playing Role <span>*</span></label>
                            <select
                                name="playingRole"
                                className="cp-select"
                                value={formData.playingRole}
                                onChange={handleChange}
                            >
                                <option value="Batsman">Batsman</option>
                                <option value="Bowler">Bowler</option>
                                <option value="All-rounder">All-rounder</option>
                                <option value="Wicketkeeper">Wicketkeeper</option>
                                <option value="Forward">Forward</option>
                                <option value="Midfielder">Midfielder</option>
                                <option value="Defender">Defender</option>
                            </select>
                        </div>

                        {/* ── Optional Physical Stats ── */}
                        <div className="cp-divider">Optional</div>

                        <div className="cp-row">
                            <div className="cp-field">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    className="cp-input"
                                    value={formData.height}
                                    onChange={handleChange}
                                    placeholder="e.g. 180"
                                />
                            </div>
                            <div className="cp-field">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className="cp-input"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="e.g. 75"
                                />
                            </div>
                        </div>

                        <div className="cp-field">
                            <label>Past Injuries</label>
                            <textarea
                                name="pastInjuries"
                                className="cp-textarea"
                                value={formData.pastInjuries}
                                onChange={handleChange}
                                placeholder="Comma-separated, e.g. ACL tear 2023, Ankle sprain 2024"
                                rows="3"
                            />
                            <span className="cp-hint">Separate multiple injuries with a comma.</span>
                        </div>

                        <button type="submit" className="cp-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="cp-btn-spinner"></span>
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CompleteProfile;
