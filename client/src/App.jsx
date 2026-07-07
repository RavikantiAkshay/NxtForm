import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import MyFormsPage from './pages/MyFormsPage';
import WorkspaceBuilder from './pages/WorkspaceBuilder';
import ResponseDashboard from './pages/ResponseDashboard';

// Simple Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('nxtform_token');
  if (!token) {
    // If not logged in, redirect to auth page
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/auth" 
          element={
            localStorage.getItem('nxtform_token') ? <Navigate to="/workspace" replace /> : <AuthPage />
          } 
        />

        {/* Protected App Routes */}
        <Route 
          path="/workspace" 
          element={
            <ProtectedRoute>
              <MyFormsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspace/edit" 
          element={
            <ProtectedRoute>
              <WorkspaceBuilder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/:id" 
          element={
            <ProtectedRoute>
              <ResponseDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
