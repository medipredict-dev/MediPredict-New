import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Player');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // In Module 2, the endpoint expects 'roleName' instead of 'role' if using the detailed Role model
            // But keeping backward compatibility or checking backend:
            // Typically 'role' or 'roleName'. Let's use 'roleName' as per previous backend code.
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                roleName: role
            });

            if (response.data.token) {
                // Auto login after register
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Register</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleRegister} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.input}
                    >
                        <option value="Player">Player</option>
                        <option value="Coach">Coach</option>
                        <option value="Medical">Medical Staff</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <button type="submit" style={styles.button}>Register</button>
            </form>
            <p style={styles.link}>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    inputGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    button: {
        padding: '10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    error: {
        color: 'red',
        marginBottom: '10px'
    },
    link: {
        textAlign: 'center',
        marginTop: '15px'
    }
};

export default Register;
