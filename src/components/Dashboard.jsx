import React from 'react';

import Header from './Header';
import Filters from './Filters';
import Sidebar from './Sidebar';
import ChatSection from './ChatSection';
import AddLeadModal from './AddLeadModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Dashboard() {
  return (
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
  );
}

export default Dashboard;
