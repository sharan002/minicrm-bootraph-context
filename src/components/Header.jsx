import React from 'react';
import { useApp } from '../context/AppContext';
import { getLeadSourceIcon } from '../utils/notificationUtils';

const Header = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedUser,
    searchQuery,
    setSearchQuery,
    showNotifications,
    setShowNotifications,
    unreadLeads,
    notificationSound,
    setNotificationSound,
    browserNotifications,
    setBrowserNotifications,
    markAllAsRead,
    markAsRead,
    setShowModal,
    showMobileSidebar,
    setShowMobileSidebar,
    users,
    notificationRef
  } = useApp();

  const tabCounts = {
    all: users.length,
    whatsapp: users.filter(
      (u) => u.leadfrom?.toLowerCase() === 'whatsapp' && !u.respondedAfterFollowUp
    ).length,
    metaads: users.filter(
      (u) => u.leadfrom?.toLowerCase() === 'metaads' && !u.respondedAfterFollowUp
    ).length,
    website: users.filter(
      (u) => u.leadfrom?.toLowerCase() === 'website' && !u.respondedAfterFollowUp
    ).length,
    respondedAfterFollowUp: users.filter((u) => u.respondedAfterFollowUp).length,
    'manual entry': users.filter(
      (u) => u.leadfrom?.toLowerCase() === 'manual entry' && !u.respondedAfterFollowUp
    ).length,
  };

  return (
<header className="bg-white shadow-sm border-bottom">
  {/* Replace container-fluid with padding control */}
  <div className="px-3"> 
    <div className="d-flex align-items-center justify-content-between py-2 position-relative">
      
      {/* Left: Lead Manager + Tabs */}
      <div className="d-flex align-items-center flex-wrap">
        <div className="d-flex align-items-center me-4">
          <div className="bg-primary text-white p-2 rounded me-2">
            <i className="fas fa-chart-line fs-5"></i>
          </div>
          <h1 className="h5 mb-0 fw-bold text-dark">Lead Manager</h1>
        </div>

        <div className="d-none d-md-flex align-items-center flex-wrap">
          {['all', 'whatsapp', 'metaads', 'website', 'respondedAfterFollowUp', 'manual entry'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedUser(null);
              }}
              className={`btn btn-sm mx-1 d-flex align-items-center ${
                activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'
              }`}
            >
              {tab === 'respondedAfterFollowUp'
                ? 'Responded'
                : tab === 'manual entry'
                ? 'Manual'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ms-1 fw-semibold">({tabCounts[tab] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Search + Notifications + Add Lead */}
      <div className="d-flex align-items-center position-relative">
        {/* Search */}
        <div className="input-group me-3 d-none d-sm-flex" style={{ maxWidth: '250px' }}>
          <span className="input-group-text">
            <i className="fas fa-search text-muted"></i>
          </span>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
          />
        </div>

        {/* Notifications */}
        <div className="dropdown me-3" ref={notificationRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-outline-secondary position-relative"
          >
            <i className="fas fa-bell"></i>
            {unreadLeads.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadLeads.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-sm"
              style={{
                width: '300px',
                position: 'absolute',
                right: 0,
                top: '110%',
                zIndex: 1000,
              }}
            >
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h6 className="mb-0 fw-semibold">Notifications</h6>
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => setNotificationSound(!notificationSound)}
                    className={`btn btn-sm ${notificationSound ? 'btn-primary' : 'btn-outline-secondary'} me-1`}
                  >
                    <i className="fas fa-bell"></i>
                  </button>
                  <button
                    onClick={() => setBrowserNotifications(!browserNotifications)}
                    className={`btn btn-sm ${browserNotifications ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  >
                    <i className="fas fa-desktop"></i>
                  </button>
                  {unreadLeads.length > 0 && (
                    <button onClick={markAllAsRead} className="btn btn-sm btn-outline-primary">
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {unreadLeads.length > 0 ? (
                  unreadLeads.map((leadId) => {
                    const lead = users.find((u) => u._id === leadId);
                    if (!lead) return null;

                    return (
                      <div
                        key={leadId}
                        className="dropdown-item d-flex align-items-start p-3 border-bottom"
                        onClick={() => {
                          setSelectedUser(lead);
                          markAsRead(leadId);
                          setShowNotifications(false);
                          if (window.innerWidth < 768) setShowMobileSidebar(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className={`p-2 rounded-circle ${
                            lead.respondedAfterFollowUp ? 'bg-success' : 'bg-primary'
                          } me-3`}
                        >
                          <i className={`${getLeadSourceIcon(lead.leadfrom)} text-white`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="fw-medium mb-1 text-dark">{lead.userName}</p>
                          <p className="text-muted small mb-1">{lead.course}</p>
                          <p className="text-muted small mb-0">New lead received</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-4 text-muted">
                    <i className="fas fa-bell-slash fs-1 mb-2"></i>
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Lead */}
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <i className="fas fa-plus me-1"></i>
          <span className="d-none d-sm-inline">Add Lead</span>
        </button>
      </div>
    </div>

    {/* Mobile Tabs */}
    <div className="d-md-none mt-2 d-flex overflow-auto pb-2">
      {['all', 'whatsapp', 'metaads', 'website', 'respondedAfterFollowUp', 'manual entry'].map((tab) => (
        <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            setSelectedUser(null);
          }}
          className={`btn btn-sm me-1 flex-shrink-0 ${
            activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'
          }`}
        >
          {tab === 'respondedAfterFollowUp'
            ? 'Responded'
            : tab === 'manual entry'
            ? 'Manual'
            : tab.charAt(0).toUpperCase() + tab.slice(1)}
          <span className="ms-1">({tabCounts[tab] || 0})</span>
        </button>
      ))}
    </div>
  </div>
</header>

  );
};

export default Header;
