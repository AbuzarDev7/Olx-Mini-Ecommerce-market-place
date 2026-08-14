import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImgUrl, setProfileImgUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const { registerUser, googleSignIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user-img');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfu6dxt8o/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setProfileImgUrl(data.secure_url);
        Swal.fire('Success', 'Profile picture uploaded!', 'success');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Swal.fire('Upload Failed', err.message, 'error');
    } finally {
      setUploadingImg(false);
    }
  };

  const openCloudinaryWidget = () => {
    if (typeof window.cloudinary !== 'undefined') {
      try {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: 'dfu6dxt8o',
            uploadPreset: 'user-img',
            sources: ['local', 'url', 'camera']
          },
          (error, result) => {
            if (!error && result && result.event === 'success') {
              setProfileImgUrl(result.info.secure_url);
            }
          }
        );
        widget.open();
        return;
      } catch (err) {
        console.warn('Cloudinary widget fallback:', err);
      }
    }
    document.getElementById('native_file_input').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullname) {
      Swal.fire('Required', 'Please fill in all required fields!', 'warning');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email.trim(), password, fullname.trim(), profileImgUrl);
      // Logout so user must log in via /login as requested
      await logout();
      await Swal.fire({
        icon: 'success',
        title: 'Account Created Successfully!',
        text: 'Your account has been created. Please log in with your email and password.',
        confirmButtonColor: '#002f34',
        confirmButtonText: 'Go to Login'
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration Error:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters long.';
      }
      Swal.fire('Registration Failed', errorMsg, 'error');
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
        text: 'Logged in successfully!',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      let msg = error.message;
      if (error.code === 'auth/unauthorized-domain') {
        msg = `Domain '${window.location.hostname}' is not authorized in Firebase Console.\n\nPlease add '${window.location.hostname}' in Firebase Console > Authentication > Settings > Authorized Domains.`;
      } else if (error.code === 'auth/popup-blocked') {
        msg = 'Pop-up blocked by browser. Please allow pop-ups for Google Sign-In.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in pop-up was closed before completion.';
      }
      Swal.fire('Google Sign-In Error', msg, 'error');
    }
  };

  return (
    <div className="auth-body-register">
      <main className="register-card" role="main">
        <div className="top">
          <div className="logo">
            <Link to="/">
              <img src="https://logos-world.net/wp-content/uploads/2022/04/OLX-Symbol.png" alt="OLX Logo" />
            </Link>
          </div>
          <div>
            <h1 className="heading">Create Account</h1>
            <div className="subtitle">Join Marketplace — buy & sell in your city</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              placeholder="e.g. Ali Khan"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="inpEmail">Email Address</label>
            <input
              id="inpEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="inpPassword">Password</label>
            <input
              id="inpPassword"
              type="password"
              placeholder="Choose a strong password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Profile Picture (Optional)</label>
            <button type="button" onClick={openCloudinaryWidget} className="cloudinary-button">
              {uploadingImg ? (
                <>Uploading Image...</>
              ) : profileImgUrl ? (
                <> Profile Picture Uploaded</>
              ) : (
                <>Select Profile Picture</>
              )}
            </button>
            <input
              type="file"
              id="native_file_input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            {profileImgUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img
                  src={profileImgUrl}
                  alt="Profile Preview"
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '2px solid #002f34',
                    objectFit: 'cover',
                    display: 'inline-block'
                  }}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? <>Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <div className="or">OR</div>

        <div className="social-login">
          <div className="social-btn" onClick={handleGoogleLogin}>
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google Logo" />
            Continue with Google
          </div>
        </div>

        <div className="login-link" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </main>
    </div>
  );
}
