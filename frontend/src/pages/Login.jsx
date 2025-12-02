// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config'; // Import the initialized firebase app

const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
        backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif'
    },
    card: {
        backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%', maxWidth: '400px',
    },
    title: {
        fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px', textAlign: 'center'
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block', color: '#374151', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px',
    },
    input: {
        width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
        fontSize: '1rem', transition: 'border-color 0.2s', boxSizing: 'border-box',
    },
    button: {
        width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none',
        borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s',
        marginTop: '10px',
    },
    link: {
        display: 'block', textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#1f2937',
        cursor: 'pointer', textDecoration: 'none',
    },
    error: {
        color: '#ef4444', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', fontWeight: '500',
    }
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth(app);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Simple Firebase sign-in with email and password
            await signInWithEmailAndPassword(auth, email, password);
            // On successful login, Firebase updates the auth state, and App.jsx will handle navigation
            console.log('Login successful.');
            // Optionally navigate directly, though App.jsx should handle the route change
            navigate('/'); 

        } catch (err) {
            console.error('Login Error:', err);
            // Translate Firebase error codes to user-friendly messages
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/invalid-email') {
                setError('The email address is not valid.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Agent Login</h1>
                <form onSubmit={handleLogin}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <a style={styles.link} onClick={() => navigate('/signup')}>
                    Don't have an account? **Sign Up**
                </a>
            </div>
        </div>
    );
}
