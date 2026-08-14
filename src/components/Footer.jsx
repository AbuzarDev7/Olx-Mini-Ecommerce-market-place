import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} OLX Clone Marketplace. Built with Vite, React & Firebase Client SDK.</p>
    </footer>
  );
}
