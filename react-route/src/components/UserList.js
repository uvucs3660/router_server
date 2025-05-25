import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserCard from './UserCard';
import { getAllUsers } from '../utils/localStorage';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = getAllUsers();
      setUsers(storedUsers);
    };

    loadUsers();

    // Listen for storage changes to update the list when data changes
    const handleStorageChange = () => {
      loadUsers();
    };

    window.addEventListener('userProfilesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('userProfilesUpdated', handleStorageChange);
    };
  }, []);

  const getAttributeIcon = (attribute) => {
    switch (attribute) {
      case 'slow': return '🐢';
      case 'medium': return '🚶';
      case 'fast': return '🏃';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>User Profiles</h2>
        <Link to="/new" className="btn btn-primary">
          ➕ Add New User
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>Click "Add New User" to create your first profile!</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              getAttributeIcon={getAttributeIcon}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
