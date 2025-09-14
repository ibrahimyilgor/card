import React from 'react';

export default function Info({ username, onLogout }) {
  return (
    <div className="auth-container">
      <h2>Welcome, {username}!</h2>
      <p>You are now logged in.</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
