import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from './firebase-config';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import CompanyPage from './components/CompanyPage';
import ChatbotPage from './components/ChatbotPage';

// Add route authentication wrapper
function RequireAuth({ children }) {
  const location = useLocation();
  return auth.currentUser ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Add additional user validation if needed
      if (currentUser && !currentUser.emailVerified) {
        console.warn('Email not verified');
        // Consider adding email verification requirement
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />
      
      <Route path="/company/:symbol" element={
        <RequireAuth>
          <CompanyPage />
        </RequireAuth>
      } />
      
      <Route path="/chatbot" element={
        <RequireAuth>
          <ChatbotPage />
        </RequireAuth>
      } />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;