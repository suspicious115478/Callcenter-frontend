// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config'; // Import the initialized firebase app

const API_BASE_URL = 'https://callcenter-baclend.onrender.com';

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

// 🔥 The component now accepts the onSuccessfulSignup prop
export default function Signup({ onSuccessfulSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agentId, setAgentId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth(app);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password || !agentId || !adminId) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUid = userCredential.user.uid;

            // 2. Send Agent details to your Backend
            const backendResponse = await fetch(`${API_BASE_URL}/agent/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebase_uid: firebaseUid,
                    email: email,
                    agent_id: agentId,
                    admin_id: adminId,
                }),
            });

            if (!backendResponse.ok) {
                // If backend storage fails, log out the firebase user to keep things clean
                auth.signOut();
                const errorData = await backendResponse.json();
                throw new Error(`Registration failed on backend: ${errorData.message}`);
            }

            console.log('Agent successfully registered and details saved.');
            
            // 🔥 NEW STEP 3: Notify App.jsx of successful signup
            // This is crucial to prevent the immediate redirect to the dashboard.
            if (onSuccessfulSignup) {
                onSuccessfulSignup();
            }

            // 🔥 NEW STEP 4: Redirect to the Login page.
            // The user is still technically logged in, but App.jsx will catch the flag and keep them on /login.
            navigate('/login'); 

        } catch (err) {
            console.error('Signup Error:', err);
            // Translate Firebase error codes to user-friendly messages
            if (err.code === 'auth/email-already-in-use') {
                setError('The email address is already in use.');
            } else if (err.code === 'auth/invalid-email') {
                setError('The email address is not valid.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                // Handle errors from the backend fetch or unexpected Firebase errors
                setError(err.message || 'An unexpected error occurred during signup.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Agent Sign Up</h1>
                <form onSubmit={handleSignup}>
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
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Unique Agent ID</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={agentId}
                            onChange={(e) => setAgentId(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Admin ID (The Admin you report to)</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>
                <a style={styles.link} onClick={() => navigate('/login')}>
                    Already have an account? **Log In**
                </a>
            </div>
        </div>
    );
}
