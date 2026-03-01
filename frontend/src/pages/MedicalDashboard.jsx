import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Activity, LogOut, Stethoscope, HeartPulse,
    ShieldAlert, CheckCircle, PlusCircle, Bot
} from 'lucide-react';
import doctorSilhouette from '../assets/silhouettes/doctor-silhouette.png';
import './MedicalDashboard.css';

const MedicalDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [injuries, setInjuries] = useState([]);
    const [players, setPlayers] = useState([]);
    const [selectedInjury, setSelectedInjury] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        playerId: '',
        injuryType: '',
        bodyPart: '',
        severity: 'Minor',
        status: 'Active',
        treatment: '',
        description: '',
        expectedRecoveryDays: '',
        notes: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { navigate('/login'); return; }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        const isMedical = userData.roles?.some(r => r.name === 'Medical' || r.name === 'Admin');
        if (!isMedical) { navigate('/dashboard'); return; }

        fetchDashboardData(userData.token);
    }, [navigate]);

    const fetchDashboardData = async (token) => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [statsRes, injuriesRes, playersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/medical/stats', config),
                axios.get('http://localhost:5000/api/medical/injuries', config),
                axios.get('http://localhost:5000/api/medical/players', config)
            ]);
            setStats(statsRes.data);
            setInjuries(injuriesRes.data);
            setPlayers(playersRes.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddInjury = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/medical/injuries', formData, config);
            setShowAddModal(false);
            resetForm();
            setError('');
            fetchDashboardData(token);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add injury';
            setError(errorMsg);
            console.error('Add injury error:', err.response?.data || err);
        }
    };

    const handleUpdateInjury = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/medical/injuries/${selectedInjury._id}`, formData, config);
            setShowEditModal(false);
            setSelectedInjury(null);
            resetForm();
            fetchDashboardData(token);
        } catch (err) {
            setError('Failed to update injury');
            console.error(err);
        }
    };

    const handleDeleteInjury = async (injuryId) => {
        if (!window.confirm('Delete this injury record?')) return;
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/medical/injuries/${injuryId}`, config);
            fetchDashboardData(token);
        } catch (err) {
            setError('Failed to delete injury');
            console.error(err);
        }
    };

    const openEditModal = (injury) => {
        setSelectedInjury(injury);
        setFormData({
            playerId: injury.playerId?._id || '',
            injuryType: injury.injuryType || '',
            bodyPart: injury.bodyPart || '',
            severity: injury.severity || 'Minor',
            status: injury.status || 'Active',
            treatment: injury.treatment || '',
            description: injury.description || '',
            expectedRecoveryDays: injury.expectedRecoveryDays || injury.predictedRecoveryDays || '',
            notes: injury.notes || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            playerId: '', injuryType: '', bodyPart: '',
            severity: 'Minor', status: 'Active',
            treatment: '', description: '', expectedRecoveryDays: '', notes: ''
        });
    };

    /* ── badge helpers ── */
    const severityClass = (s) =>
        s === 'Minor' ? 'md-badge md-badge-green' :
            s === 'Moderate' ? 'md-badge md-badge-yellow' :
                'md-badge md-badge-red';

    const statusClass = (s) =>
        s === 'Healed' ? 'md-badge md-badge-green' :
            s === 'Recovering' ? 'md-badge md-badge-yellow' :
                'md-badge md-badge-red';

    if (loading) {
        return (
            <div className="md-loading">
                <div className="md-spinner"></div>
                <p>Loading Medical Dashboard…</p>
            </div>
        );
    }

    /* ── Shared injury form fields (used in both Add & Edit modals) ── */
    const InjuryForm = ({ onSubmit, submitLabel }) => (
        <form onSubmit={onSubmit}>
            <div className="md-form-group">
                <label className="md-label">Player</label>
                <select name="playerId" value={formData.playerId}
                    onChange={handleInputChange} className="md-select" required>
                    <option value="">Select Player</option>
                    {players.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="md-form-row">
                <div className="md-form-group">
                    <label className="md-label">Injury Type</label>
                    <select name="injuryType" value={formData.injuryType}
                        onChange={handleInputChange} className="md-select" required>
                        <option value="">Select Type</option>
                        {['Muscle Strain', 'Ligament Sprain', 'Fracture', 'Concussion',
                            'Tendinitis', 'Dislocation', 'Contusion', 'Other'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                    </select>
                </div>
                <div className="md-form-group">
                    <label className="md-label">Body Part</label>
                    <select name="bodyPart" value={formData.bodyPart}
                        onChange={handleInputChange} className="md-select" required>
                        <option value="">Select Part</option>
                        {['Head', 'Neck', 'Shoulder', 'Arm', 'Elbow', 'Wrist', 'Hand',
                            'Back', 'Hip', 'Thigh', 'Knee', 'Ankle', 'Foot', 'Other'].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="md-form-row">
                <div className="md-form-group">
                    <label className="md-label">Severity</label>
                    <select name="severity" value={formData.severity}
                        onChange={handleInputChange} className="md-select">
                        {['Minor', 'Moderate', 'Severe', 'Critical'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="md-form-group">
                    <label className="md-label">Status</label>
                    <select name="status" value={formData.status}
                        onChange={handleInputChange} className="md-select">
                        {['Active', 'Recovering', 'Healed'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="md-form-group">
                <label className="md-label">Description *</label>
                <textarea name="description" value={formData.description}
                    onChange={handleInputChange} className="md-textarea"
                    placeholder="Describe the injury in detail…" rows="2" required />
            </div>

            <div className="md-form-group">
                <label className="md-label">Treatment</label>
                <textarea name="treatment" value={formData.treatment}
                    onChange={handleInputChange} className="md-textarea"
                    placeholder="Describe the treatment plan…" rows="3" />
            </div>

            <div className="md-form-group">
                <label className="md-label">Expected Recovery Days</label>
                <input type="number" name="expectedRecoveryDays"
                    value={formData.expectedRecoveryDays}
                    onChange={handleInputChange}
                    className="md-input" placeholder="e.g. 14" />
            </div>

            <div className="md-form-group">
                <label className="md-label">Notes</label>
                <textarea name="notes" value={formData.notes}
                    onChange={handleInputChange} className="md-textarea"
                    placeholder="Additional notes…" rows="2" />
            </div>

            <div className="md-modal-actions">
                <button type="button" className="md-btn-cancel"
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedInjury(null); resetForm(); }}>
                    Cancel
                </button>
                <button type="submit" className="md-btn-submit">{submitLabel}</button>
            </div>
        </form>
    );

    return (
        <div className="md-page">
            {/* ── Navbar ── */}
            <nav className="md-nav">
                <div className="md-nav-brand">
                    <Activity size={22} className="md-brand-icon" />
                    <span className="md-brand-text">
                        Medi<span className="md-brand-highlight">Predict</span>
                    </span>
                    <span className="md-nav-badge">Medical Staff</span>
                </div>
                <div className="md-nav-right">
                    <span className="md-nav-welcome">Welcome, <strong>{user?.name}</strong></span>
                    <button className="md-logout-btn" onClick={handleLogout}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </nav>

            <main className="md-main">
                {error && <div className="md-error">{error}</div>}

                {/* ── Page Header ── */}
                <div className="md-header">
                    <img src={doctorSilhouette} alt="Medical Staff" className="md-header-img" />
                    <div className="md-header-text">
                        <p className="md-section-label">MEDICAL DASHBOARD</p>
                        <h1 className="md-page-title">Injury Management</h1>
                        <p className="md-page-subtitle">
                            Manage player injuries, track recovery progress, and maintain
                            comprehensive medical records for the team.
                        </p>
                        <div className="md-header-actions">
                            <button className="md-btn-primary" onClick={() => setShowAddModal(true)}>
                                <PlusCircle size={16} /> Add Injury Record
                            </button>
                            <button className="md-btn-outline" onClick={() => navigate('/predictions')}>
                                <Bot size={16} /> AI Prediction Module
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="md-stats-grid">
                    <div className="md-stat-card">
                        <div className="md-stat-icon"><Stethoscope size={20} /></div>
                        <div>
                            <div className="md-stat-val">{stats?.totalInjuries ?? '—'}</div>
                            <div className="md-stat-lbl">Total Injuries</div>
                        </div>
                    </div>
                    <div className="md-stat-card">
                        <div className="md-stat-icon"><ShieldAlert size={20} /></div>
                        <div>
                            <div className="md-stat-val">{stats?.activeInjuries ?? '—'}</div>
                            <div className="md-stat-lbl">Active</div>
                        </div>
                    </div>
                    <div className="md-stat-card">
                        <div className="md-stat-icon"><HeartPulse size={20} /></div>
                        <div>
                            <div className="md-stat-val">{stats?.recoveringInjuries ?? '—'}</div>
                            <div className="md-stat-lbl">Recovering</div>
                        </div>
                    </div>
                    <div className="md-stat-card">
                        <div className="md-stat-icon"><CheckCircle size={20} /></div>
                        <div>
                            <div className="md-stat-val">{stats?.healedInjuries ?? '—'}</div>
                            <div className="md-stat-lbl">Healed</div>
                        </div>
                    </div>
                </div>

                {/* ── Injury Records Table ── */}
                <h3 className="md-section-title">Injury Records</h3>
                <div className="md-card">
                    <table className="md-table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Injury</th>
                                <th>Body Part</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Recovery Days</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {injuries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted-fg)' }}>
                                        No injury records found.
                                    </td>
                                </tr>
                            ) : injuries.map(injury => (
                                <tr key={injury._id}>
                                    <td>{injury.playerId?.name}</td>
                                    <td>{injury.injuryType}</td>
                                    <td>{injury.bodyPart}</td>
                                    <td><span className={severityClass(injury.severity)}>{injury.severity}</span></td>
                                    <td><span className={statusClass(injury.status)}>{injury.status}</span></td>
                                    <td>{injury.predictedRecoveryDays ?? '—'}</td>
                                    <td>
                                        <div className="md-btn-row">
                                            <button className="md-btn-edit" onClick={() => openEditModal(injury)}>Edit</button>
                                            <button className="md-btn-del" onClick={() => handleDeleteInjury(injury._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ── Add Injury Modal ── */}
            {showAddModal && (
                <div className="md-modal-overlay">
                    <div className="md-modal">
                        <h2 className="md-modal-title">Add New Injury Record</h2>
                        <InjuryForm onSubmit={handleAddInjury} submitLabel="Add Injury" />
                    </div>
                </div>
            )}

            {/* ── Edit Injury Modal ── */}
            {showEditModal && (
                <div className="md-modal-overlay">
                    <div className="md-modal">
                        <h2 className="md-modal-title">Edit Injury Record</h2>
                        <InjuryForm onSubmit={handleUpdateInjury} submitLabel="Update Injury" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalDashboard;
