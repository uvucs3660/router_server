import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserList from './components/UserList';
import UserEditor from './components/UserEditor';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🧨 User Profile Manager</h1>
      </header>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/edit/:id" element={<UserEditor />} />
          <Route path="/new" element={<UserEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
