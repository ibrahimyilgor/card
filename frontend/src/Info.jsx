import React, { useEffect, useState } from 'react';

export default function Info({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      setLoading(false);
      return;
    }
    const backendUrl = window.location.protocol + '//' + window.location.hostname + ':5000/user/info';
    fetch(backendUrl, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.user) {
          setUser(data.user);
        } else {
          setError(data.error || 'Failed to fetch user info');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="auth-container">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <>
          <div className="auth-error">{error}</div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <h2>Welcome, {user.username}!</h2>
          <p>User ID: {user.id}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}
