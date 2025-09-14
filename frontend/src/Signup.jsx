import React, { useState } from 'react';
import './Auth.css';

export default function Signup({ onSignup, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const backendUrl = window.location.protocol + '//' + window.location.hostname + ':5000/auth/register';
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        onSignup && onSignup(username);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      {success && <div className="auth-success">Signup successful! You can now log in.</div>}
      {error && <div className="auth-error">{error}</div>}
      <p>Already have an account? <button className="link" onClick={onSwitch}>Login</button></p>
    </div>
  );
}
