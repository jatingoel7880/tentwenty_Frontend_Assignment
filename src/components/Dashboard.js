import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowUserMenu(false);
    if (onLogout) onLogout();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">ticktock</h1>
            <span className="dashboard-subtitle">Timesheets</span>
          </div>
          <div className="header-right">
            <div className="user-dropdown">
              <div className="user-info" onClick={toggleUserMenu}>
                <span className="user-name">{user.name}</span>
                {showUserMenu ? (
                  <MdKeyboardArrowUp className="dropdown-arrow" />
                ) : (
                  <MdKeyboardArrowDown className="dropdown-arrow" />
                )}
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default Dashboard;
