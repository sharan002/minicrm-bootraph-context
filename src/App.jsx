import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Filters from './components/Filters';
import Sidebar from './components/Sidebar';
import ChatSection from './components/ChatSection';
import AddLeadModal from './components/AddLeadModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
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

export default App;