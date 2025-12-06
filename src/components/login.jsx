import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Login() {
  const [usernum, setUsernum] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { HandleLead } = useApp();

  const handleLogin = (e) => {
    e.preventDefault();

    // Pass username + password + navigate to context
    HandleLead(usernum, password, navigate);
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
        <h3 className="text-center mb-3">Login</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={usernum}
              onChange={(e) => setUsernum(e.target.value)}  // ✅ FIXED
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
