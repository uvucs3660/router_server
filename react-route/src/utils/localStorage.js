const STORAGE_KEY = 'userProfiles';

// Generate a simple unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all users from localStorage
export const getAllUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return [];
  }
};

// Get a specific user by ID
export const getUserById = (id) => {
  const users = getAllUsers();
  return users.find(user => user.id === id);
};

// Save or update a user
export const saveUser = (user) => {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userProfilesUpdated'));

    return user;
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
    return null;
  }
};

// Delete a user
export const deleteUser = (id) => {
  try {
    const users = getAllUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userProfilesUpdated'));

    return true;
  } catch (error) {
    console.error('Error deleting user from localStorage:', error);
    return false;
  }
};

// Clear all users (for development/testing)
export const clearAllUsers = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('userProfilesUpdated'));
    return true;
  } catch (error) {
    console.error('Error clearing users from localStorage:', error);
    return false;
  }
};
