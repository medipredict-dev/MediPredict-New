import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import coachSilhouette from '../assets/silhouettes/coach-silhouette.png';

const CoachDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [players, setPlayers] = useState([]);
    const [injuries, setInjuries] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        const isCoach = userData.roles?.some(role =>
            role.name === 'Coach' || role.name === 'Admin'
        );

        if (!isCoach) {
            navigate('/dashboard');
            return;
        }

        fetchDashboardData(userData.token);
    }, [navigate]);

    const fetchDashboardData = async (token) => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [statsRes, playersRes, injuriesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/coach/stats', config),
                axios.get('http://localhost:5000/api/coach/players', config),
                axios.get('http://localhost:5000/api/coach/injuries', config)
            ]);

            setStats(statsRes.data);
            setPlayers(playersRes.data);
            setInjuries(injuriesRes.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getSeverityColor = (severity) => {
        const colors = {
            Mild: '#22c55e',
            Moderate: '#eab308',
            Severe: '#f97316',
            Critical: '#dc2626'
        };
        return colors[severity] || '#6b7280';
    };

    const getStatusColor = (status) => {
        const colors = {
            Active: '#dc2626',
            Recovering: '#eab308',
            Healed: '#22c55e'
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="dashboard-header">
                <div className="spinner"></div>
                <p>Loading Coach Dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>MediPredict</h1>
                        <span className="badge-lime" style={{ marginLeft: '1rem' }}>Coach Dashboard</span>
                    </div>
                    <div>
                        <span style={{ marginRight: '1.5rem' }}>Welcome, {user?.name}</span>
                        <button onClick={handleLogout} className="button-primary">Logout</button>
                    </div>
                </div>
            </header>

            {error && <div style={{ color: 'red', textAlign: 'center', margin: '1rem 0' }}>{error}</div>}

            <main style={{ padding: '2rem' }}>
                {/* Welcome Section with Coach Silhouette */}
                <section style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <img src={coachSilhouette} alt="Coach" style={{ width: 180, height: 'auto', marginRight: '2rem' }} />
                    <div>
                        <h2 style={{ color: 'var(--color-navy)', margin: 0 }}>Coach Dashboard</h2>
                        <p style={{ color: 'var(--color-navy)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Monitor your team's health and injury status.<br />
                            Track player recovery and manage team performance.
                        </p>
                    </div>
                </section>

                {/* Stats Cards */}
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div className="stats-card">
                            <div style={{ fontWeight: 700, fontSize: '2rem' }}>{stats?.totalPlayers ?? '-'}</div>
                            <div>Total Players</div>
                        </div>
                        <div className="stats-card">
                            <div style={{ fontWeight: 700, fontSize: '2rem' }}>{stats?.availablePlayers ?? '-'}</div>
                            <div>Available</div>
                        </div>
                        <div className="stats-card">
                            <div style={{ fontWeight: 700, fontSize: '2rem' }}>{stats?.injuredPlayers ?? '-'}</div>
                            <div>Injured</div>
                        </div>
                        <div className="stats-card">
                            <div style={{ fontWeight: 700, fontSize: '2rem' }}>{stats?.recoveringPlayers ?? '-'}</div>
                            <div>Recovering</div>
                        </div>
                    </div>
                </section>

                {/* Team Players List */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--color-navy)' }}>Team Players</h3>
                    <div style={{ background: 'var(--color-white)', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '1rem', border: '1px solid var(--color-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-gray)', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Name</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Team</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Position</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map(player => (
                                    <tr key={player._id} style={{ borderBottom: '1px solid var(--color-gray)' }}>
                                        <td style={{ padding: '0.7rem' }}>{player.name}</td>
                                        <td style={{ padding: '0.7rem' }}>{player.team}</td>
                                        <td style={{ padding: '0.7rem' }}>{player.position}</td>
                                        <td style={{ padding: '0.7rem' }}>
                                            <span className="badge-lime">{player.status || "Unknown"}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Current Injuries */}
                <section>
                    <h3 style={{ color: 'var(--color-navy)' }}>Current Injuries</h3>
                    <div style={{ background: 'var(--color-white)', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '1rem', border: '1px solid var(--color-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-gray)', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Player</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Injury</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Severity</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Status</th>
                                    <th style={{ padding: '0.7rem', color: 'var(--color-muted)', fontWeight: '500' }}>Recovery Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {injuries.map(injury => (
                                    <tr key={injury._id} style={{ borderBottom: '1px solid var(--color-gray)' }}>
                                        <td style={{ padding: '0.7rem' }}>{injury.playerId?.name}</td>
                                        <td style={{ padding: '0.7rem' }}>{injury.injuryType}</td>
                                        <td style={{ padding: '0.7rem' }}>
                                            <span className="badge-lime">{injury.severity}</span>
                                        </td>
                                        <td style={{ padding: '0.7rem' }}>
                                            <span className="badge-lime">{injury.status}</span>
                                        </td>
                                        <td style={{ padding: '0.7rem' }}>{injury.predictedRecoveryDays ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
        fontFamily: "'Inter', system-ui, sans-serif"
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #1e293b',
        borderTop: '4px solid #0ce88d',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        marginTop: '20px',
        color: '#94a3b8',
        fontSize: '18px'
    },
    header: {
        backgroundColor: '#131b26',
        color: '#f8fafc',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        borderBottom: '1px solid #1e293b'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    logo: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0ce88d'
    },
    roleTag: {
        backgroundColor: 'rgba(12, 232, 141, 0.1)',
        color: '#0ce88d',
        border: '1px solid #0ce88d',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '14px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    welcomeText: {
        fontSize: '16px',
        color: '#f8fafc'
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        color: '#f8fafc',
        border: '1px solid #1e293b',
        padding: '8px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s'
    },
    error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid #ef4444',
        padding: '15px',
        margin: '20px 30px',
        borderRadius: '8px',
        textAlign: 'center'
    },
    main: {
        padding: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    welcomeSection: {
        backgroundColor: '#131b26',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
    },
    welcomeContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '40px'
    },
    welcomeText2: {
        flex: 1
    },
    welcomeTitle: {
        margin: '0 0 15px 0',
        fontSize: '32px',
        color: '#0ce88d'
    },
    welcomeSubtitle: {
        margin: 0,
        fontSize: '18px',
        color: '#94a3b8',
        lineHeight: '1.6'
    },
    statsSection: {
        marginBottom: '30px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
    },
    statCard: {
        backgroundColor: '#131b26',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
    },
    statIcon: {
        fontSize: '40px'
    },
    statInfo: {},
    statValue: {
        margin: '0 0 5px 0',
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#f8fafc'
    },
    statLabel: {
        margin: 0,
        fontSize: '14px',
        color: '#94a3b8'
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px'
    },
    card: {
        backgroundColor: '#131b26',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '25px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
    },
    cardTitle: {
        margin: '0 0 20px 0',
        fontSize: '20px',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    playersList: {
        maxHeight: '400px',
        overflowY: 'auto'
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        padding: '40px'
    },
    playerItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginBottom: '10px',
        transition: 'background-color 0.2s',
        border: '1px solid #1e293b'
    },
    playerAvatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: '#131b26',
        border: '1px solid #0ce88d',
        color: '#0ce88d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '18px'
    },
    playerInfo: {
        flex: 1,
        marginLeft: '15px'
    },
    playerName: {
        margin: '0 0 3px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#f8fafc'
    },
    playerRole: {
        margin: 0,
        fontSize: '13px',
        color: '#94a3b8'
    },
    statusBadge: {
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    injuriesList: {
        maxHeight: '400px',
        overflowY: 'auto'
    },
    injuryItem: {
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #1e293b',
        marginBottom: '15px'
    },
    injuryHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    injuryPlayer: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#f8fafc'
    },
    severityBadge: {
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '600'
    },
    injuryType: {
        margin: '0 0 5px 0',
        fontSize: '15px',
        color: '#f8fafc',
        fontWeight: '500'
    },
    injuryBody: {
        margin: '0 0 10px 0',
        fontSize: '14px',
        color: '#94a3b8'
    },
    injuryFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statusPill: {
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '600'
    },
    recoveryDays: {
        fontSize: '13px',
        color: '#94a3b8'
    },
    playerDetails: {
        backgroundColor: '#131b26',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '25px',
        marginTop: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column'
    },
    detailLabel: {
        fontSize: '13px',
        color: '#94a3b8',
        marginBottom: '5px'
    },
    detailValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#f8fafc'
    },
    closeBtn: {
        backgroundColor: 'transparent',
        color: '#f8fafc',
        border: '1px solid #1e293b',
        padding: '10px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default CoachDashboard;
