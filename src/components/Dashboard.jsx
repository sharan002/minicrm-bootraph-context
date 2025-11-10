import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppProvider } from '../context/AppContext';
import Header from './Header';
import Filters from './Filters';
import Sidebar from './Sidebar';
import ChatSection from './ChatSection';
import AddLeadModal from './AddLeadModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // 🔒 Verify JWT token from cookies on page load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get('http://localhost:5030/api/dashboard', {
          withCredentials: true,
        });
        if (res.status === 200) setIsAuthenticated(true);
      } catch (err) {
        alert('⚠️ Session expired! Please log in again.');
        navigate('/');
      }
    };
    verifyUser();
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <h4>Verifying session...</h4>
      </div>
    );
  }

  // ✅ Once verified, show your full CRM UI
  return (
    <AppProvider>
      <div className="d-flex flex-column vh-100">
        <Header />
        <Filters />
        <div className="flex-grow-1 d-flex overflow-hidden">
          <div className="col-md-4 col-lg-3 h-100">
            <Sidebar />
          </div>
          <div className="col-md-8 col-lg-9 h-100">
            <ChatSection />
          </div>
        </div>
        <AddLeadModal />
        <DeleteConfirmModal />
      </div>
    </AppProvider>
  );
}

export default Dashboard;
