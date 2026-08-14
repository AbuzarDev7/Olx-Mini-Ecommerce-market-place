import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire('Required', 'Please fill in both email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      await Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Logged in successfully!',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password. Please check your credentials.';
      }
      Swal.fire('Login Failed', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      await Swal.fire({
        icon: 'success',
        title: 'Google Sign-In Successful',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      Swal.fire('Sign-In Failed', error.message, 'error');
    }
  };

  return (
    <div className="auth-body-login">
      <main className="login-box" role="main">
        <div className="logo">
          <Link to="/">
            <img src="https://logos-world.net/wp-content/uploads/2022/04/OLX-Symbol.png" alt="OLX Logo" />
          </Link>
        </div>

        <h2>Login to Account</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="inpEmail">Email Address</label>
          <input
            type="email"
            id="inpEmail"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="inpPassword">Password</label>
          <input
            type="password"
            id="inpPassword"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <>Logging in...</> : 'Login'}
          </button>

          <div className="or">OR</div>

          <div className="social-login">
            <div className="social-btn" onClick={handleGoogleLogin}>
              <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google Logo" />
              Continue with Google
            </div>
          </div>
        </form>

        <div className="signup-text">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </main>
    </div>
  );
}
