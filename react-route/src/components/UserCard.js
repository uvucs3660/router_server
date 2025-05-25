import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user, getAttributeIcon, formatDate }) => {
  const isExplosionSoon = () => {
    const now = new Date();
    const explosionDate = new Date(user.nextExplosionDate);
    const timeDiff = explosionDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  const isExplosionOverdue = () => {
    const now = new Date();
    const explosionDate = new Date(user.nextExplosionDate);
    return explosionDate < now;
  };

  return (
    <Link to={`/edit/${user.id}`} className="user-card-link">
      <div className={`user-card ${isExplosionOverdue() ? 'overdue' : isExplosionSoon() ? 'warning' : ''}`}>
        <div className="user-avatar">
          {user.picture ? (
            <img src={user.picture} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              👤
            </div>
          )}
        </div>

        <div className="user-info">
          <h3>{user.name || 'Unnamed User'}</h3>
          <p className="user-description">{user.description || 'No description'}</p>

          <div className="user-attributes">
            <span className="attribute-badge">
              {getAttributeIcon(user.attribute)} {user.attribute}
            </span>
          </div>

          <div className="explosion-info">
            <span className="explosion-label">💥 Next Explosion:</span>
            <span className={`explosion-date ${isExplosionOverdue() ? 'overdue' : isExplosionSoon() ? 'warning' : ''}`}>
              {formatDate(user.nextExplosionDate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
