import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, saveUser, generateId } from '../utils/localStorage';

const UserEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewUser = !id;

  const [user, setUser] = useState({
    id: '',
    name: '',
    description: '',
    attribute: 'medium',
    nextExplosionDate: '',
    picture: ''
  });

  const [isLoading, setIsLoading] = useState(!isNewUser);

  useEffect(() => {
    if (isNewUser) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      setUser(prev => ({
        ...prev,
        id: generateId(),
        nextExplosionDate: tomorrow.toISOString().slice(0, 16)
      }));
    } else {
      const existingUser = getUserById(id);
      if (existingUser) {
        // Convert date to datetime-local format
        const formattedUser = {
          ...existingUser,
          nextExplosionDate: new Date(existingUser.nextExplosionDate).toISOString().slice(0, 16)
        };
        setUser(formattedUser);
      } else {
        navigate('/');
      }
      setIsLoading(false);
    }
  }, [id, isNewUser, navigate]);

  const handleInputChange = (field, value) => {
    const updatedUser = { ...user, [field]: value };
    setUser(updatedUser);

    // Save immediately on change
    if (!isNewUser || updatedUser.name.trim()) {
      // Convert datetime-local back to ISO string for storage
      const userToSave = {
        ...updatedUser,
        nextExplosionDate: new Date(updatedUser.nextExplosionDate).toISOString()
      };
      saveUser(userToSave);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('picture', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    // Ensure final save before closing
    if (user.name.trim()) {
      const userToSave = {
        ...user,
        nextExplosionDate: new Date(user.nextExplosionDate).toISOString()
      };
      saveUser(userToSave);
    }
    navigate('/');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-editor">
      <div className="editor-header">
        <h2>{isNewUser ? '➕ Create New User' : '✏️ Edit User Profile'}</h2>
        <button onClick={handleClose} className="btn btn-secondary close-btn">
          ❌ Close
        </button>
      </div>

      <div className="editor-content">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={user.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter user name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={user.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter user description"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="attribute">Attribute:</label>
            <select
              id="attribute"
              value={user.attribute}
              onChange={(e) => handleInputChange('attribute', e.target.value)}
              className="form-select"
            >
              <option value="slow">🐢 Slow</option>
              <option value="medium">🚶 Medium</option>
              <option value="fast">🏃 Fast</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nextExplosionDate">Next Explosion Date:</label>
            <input
              id="nextExplosionDate"
              type="datetime-local"
              value={user.nextExplosionDate}
              onChange={(e) => handleInputChange('nextExplosionDate', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="picture">Profile Picture:</label>
            <input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-input"
            />
            {user.picture && (
              <div className="image-preview">
                <img src={user.picture} alt="Profile preview" />
              </div>
            )}
          </div>
        </div>

        <div className="preview-section">
          <h3>Preview</h3>
          <div className="user-card preview">
            <div className="user-avatar">
              {user.picture ? (
                <img src={user.picture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <div className="user-info">
              <h4>{user.name || 'Unnamed User'}</h4>
              <p>{user.description || 'No description'}</p>
              <div className="user-attributes">
                <span className="attribute-badge">
                  {user.attribute === 'slow' ? '🐢' : user.attribute === 'medium' ? '🚶' : '🏃'} {user.attribute}
                </span>
              </div>
              <div className="explosion-info">
                <span>💥 Next Explosion: {user.nextExplosionDate ? new Date(user.nextExplosionDate).toLocaleString() : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditor;
