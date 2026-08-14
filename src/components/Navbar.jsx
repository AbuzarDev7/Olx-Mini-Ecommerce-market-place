import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Navbar({ searchTerm, setSearchTerm }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#002f34',
      confirmButtonText: 'Yes, logout'
    });

    if (result.isConfirmed) {
      await logout();
      navigate('/login');
    }
  };

  const userAvatar = userProfile?.profile || currentUser?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  return (
    <nav className="navbar">
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <img src="https://logos-world.net/wp-content/uploads/2022/04/OLX-Symbol.png" alt="OLX Logo" />
          <span>OLX Clone</span>
        </Link>

        <Link to="/upload" className="upload-link">
          <button className="upload-btn">
            <i className="fa-solid fa-plus"></i> Sell Product
          </button>
        </Link>
      </div>

      {setSearchTerm !== undefined && (
        <div className="nav-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search cars, phones, laptops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="user-section">
        {currentUser ? (
          <>
            <div className="profile" title={currentUser.email}>
              <img src={userAvatar} alt="Profile" />
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            <button className="login-btn">
              <i className="fa-solid fa-right-to-bracket"></i> Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
