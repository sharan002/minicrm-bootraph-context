import React from 'react';
import { useApp } from '../context/AppContext';
import { getLeadSourceIcon } from '../utils/notificationUtils';

const Sidebar = () => {
  const {
    users,
    activeTab,
    selectedUser,
    setSelectedUser,
    setShowDeleteConfirm,
    setLeadToDelete,
    unreadLeads,
    markAsRead,
    showMobileSidebar,
    setShowMobileSidebar,
    searchQuery,
    sortBy,
    courseFilter,
    leadSourceFilter,
    pipelineFilter,
    statusFilter,
    programTypeFilter,
    professionFilter,
    assignedToFilter,
    dateCreatedFilter,
  } = useApp();

  // Helper functions
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'New': 'primary',
      'Active': 'success',
      'Pending': 'warning',
      'Closed': 'secondary',
      'Follow-up': 'info'
    };
    return statusMap[status] || 'secondary';
  };

  const getPipelineColor = (pipeline) => {
    const pipelineMap = {
      'New': 'info',
      'Qualified': 'success',
      'Proposal': 'warning',
      'Negotiation': 'primary',
      'Closed': 'secondary'
    };
    return pipelineMap[pipeline] || 'secondary';
  };

  const getLatestMessage = (user) => {
    if (!user.conversations || user.conversations.length === 0) {
      return "No conversation yet";
    }
    const lastMsg = user.conversations[user.conversations.length - 1];
    return lastMsg.userMsg || lastMsg.botReply || "New message";
  };

  const getUserInitials = (name) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (activeTab !== "all") {
      if (activeTab === "respondedAfterFollowUp") {
        if (!user.respondedAfterFollowUp) return false;
      } else if (user.respondedAfterFollowUp) {
        return false;
      } else if (
        user.leadfrom?.toLowerCase() !== activeTab.toLowerCase()
      ) {
        return false;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        user.userName?.toLowerCase().includes(query) ||
        user.userNumber?.includes(query) ||
        user.course?.toLowerCase().includes(query) ||
        user.city?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    if (courseFilter && user.course !== courseFilter) return false;
    if (leadSourceFilter && user.leadfrom !== leadSourceFilter) return false;
    if (pipelineFilter && user.pipeline !== pipelineFilter) return false;

    if (statusFilter) {
      const uStatus = user.status || user.leadStatus;
      if (uStatus !== statusFilter) return false;
    }

    if (programTypeFilter) {
      const uProg = user.programType || user.programtype;
      if (uProg !== programTypeFilter) return false;
    }

    if (professionFilter && user.profession !== professionFilter) return false;

    if (assignedToFilter) {
      const uAssign = user.assignedTo || user.assignedto;
      if (uAssign !== assignedToFilter) return false;
    }

    if (dateCreatedFilter) {
      if (!user.datecreated) return false;
      const userDate = new Date(user.datecreated).toISOString().split('T')[0];
      if (userDate !== dateCreatedFilter) return false;
    }

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.datecreated) - new Date(a.datecreated);
    } else if (sortBy === "oldest") {
      return new Date(a.datecreated) - new Date(b.datecreated);
    } else if (sortBy === "name") {
      return (a.userName || "").localeCompare(b.userName || "");
    }
    return 0;
  });

  return (
    <div className={`${showMobileSidebar ? 'd-block' : 'd-none'} d-md-flex flex-column h-100 bg-white border-end`}>
      {/* Header with improved styling */}
      <div className="p-3 border-bottom bg-light bg-gradient">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="fas fa-users me-2 text-primary"></i>
            {sortedUsers.length} {sortedUsers.length === 1 ? 'Lead' : 'Leads'}
          </h6>
          {unreadLeads.length > 0 && (
            <span className="badge bg-primary rounded-pill px-2">
              <i className="fas fa-bolt me-1"></i>
              {unreadLeads.length} new
            </span>
          )}
        </div>
      </div>

      <div className="sidebar-content flex-grow-1" style={{ overflowY: 'auto' }}>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isUnread = unreadLeads.includes(user._id);
            const hasConversations = user.conversations && user.conversations.length > 0;

            return (
              <div
                key={user._id || user.userNumber}
                onClick={() => {
                  setSelectedUser(user);
                  markAsRead(user._id);
                  if (window.innerWidth < 768) {
                    setShowMobileSidebar(false);
                  }
                }}
                className={`p-3 border-bottom cursor-pointer transition-all ${isSelected ? 'bg-primary bg-opacity-10 border-start border-primary border-3' : ''} ${isUnread ? 'bg-info bg-opacity-5' : ''}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: isSelected ? '4px solid var(--bs-primary)!important' : 'none'
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  {/* Left side - User info */}
                  <div className="d-flex align-items-start flex-grow-1" style={{ minWidth: 0 }}>
                    {/* Avatar with status */}
                    <div className="position-relative me-3">
                      <div className={`rounded-circle ${isUnread ? 'bg-primary bg-opacity-10' : 'bg-light'} d-flex align-items-center justify-content-center`}
                        style={{
                          width: "42px",
                          height: "42px",
                          border: isUnread ? '2px solid var(--bs-primary)' : '2px solid #e9ecef'
                        }}>
                        <span className={`fw-bold ${isUnread ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '14px' }}>
                          {getUserInitials(user.userName)}
                        </span>
                        {/* Unread indicator dot */}
                        {isUnread && (
                          <span className="position-absolute top-0 end-0 translate-middle badge rounded-circle bg-danger border border-1 border-white"
                            style={{ width: '10px', height: '10px', padding: 0 }}>
                            <span className="visually-hidden">New messages</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* User details */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      {/* First row: Name and status badges */}
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                          <h6 className="fw-semibold mb-0 text-dark text-truncate me-2" style={{ maxWidth: '180px' }}>
                            {user.userName}
                          </h6>
                          {(user.pipeline) && (
                            <span className={`badge bg-${getStatusColor(user.pipeline)} bg-opacity-10 text-${getStatusColor(user.pipeline)} border border-${getStatusColor(user.pipeline)} border-opacity-25`}
                              style={{ fontSize: '10px', padding: '2px 6px', whiteSpace: 'nowrap' }}>
                              {user.pipeline || user.pipeline}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Second row: Course and follow-up count */}
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                          <i className="fas fa-graduation-cap me-1 text-primary"></i>
                          {user.course || 'No course'}
                        </p>
                        {user.followUpCount > 0 && (
                          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                            style={{ fontSize: '10px', padding: '2px 6px' }}>
                            <i className="fas fa-flag me-1"></i>
                            {user.followUpCount}
                          </span>
                        )}
                      </div>

                      {/* Third row: Lead source and time */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="text-muted small">
                          <i className={`${getLeadSourceIcon(user.leadfrom)} me-1`}></i>
                          {user.leadfrom || "No source"}
                        </span>
                        <span className="text-muted small">
                          <i className="far fa-clock me-1"></i>
                          {getTimeAgo(user.lastInteracted)}
                        </span>
                      </div>

                      {/* Fourth row: Last message preview (if any) */}
                      {/* {hasConversations && (
                        <div className="mt-2">
                          <p className="text-truncate mb-0 small text-muted" 
                            style={{ 
                              maxWidth: '100%',
                              lineHeight: '1.4',
                              fontSize: '12px',
                              padding: '4px 8px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--bs-primary)'
                            }}>
                            <i className="fas fa-comment me-1 text-primary"></i>
                            {getLatestMessage(user)}
                          </p>
                        </div>
                      )} */}

                      {/* Fifth row: Pipeline and assigned to (if available) */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          {user.status && (
                            <span className={`badge bg-${getPipelineColor(user.status)} bg-opacity-10 text-${getPipelineColor(user.status)}`}
                              style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {user.status}
                            </span>
                          )}
                        </div>
                        <div>
                          {user.assignedto && (
                            <span className="text-muted small">
                              <i className="fas fa-user-tag me-1"></i>
                              {user.assignedto}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeadToDelete(user);
                      setShowDeleteConfirm(true);
                    }}
                    className="btn btn-sm btn-outline-danger ms-2 align-self-start"
                    style={{ padding: '4px 8px', marginTop: '-2px' }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>

                {/* Additional info row - Only show on hover or if selected */}
                <div className={`mt-2 ps-5 ${isSelected ? 'd-block' : 'd-none d-md-block'}`}>
                  <div className="d-flex align-items-center text-muted small gap-3">
                    <span>
                      <i className="fas fa-phone-alt me-1"></i>
                      {user.userNumber || 'No phone'}
                    </span>
                    <span>
                      <i className="fas fa-calendar-alt me-1"></i>
                      {user.datecreated ? new Date(user.datecreated).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      }) : 'N/A'}
                    </span>
                    {user.profession && (
                      <span>
                        <i className="fas fa-briefcase me-1"></i>
                        {user.profession}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-5 text-muted">
            <div className="mb-3">
              <div className="avatar-circle bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-inbox fa-lg"></i>
              </div>
            </div>
            <h6 className="fw-semibold text-dark mb-2">No leads found</h6>
            <p className="small mb-0">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Optional: Quick stats footer */}
      {/* {sortedUsers.length > 0 && (
        <div className="border-top p-2 bg-light">
          <div className="row g-1 text-center">
            <div className="col-4">
              <small className="text-muted d-block">New</small>
              <span className="fw-bold text-primary small">
                {sortedUsers.filter(u => u.status === 'New').length}
              </span>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Active</small>
              <span className="fw-bold text-success small">
                {sortedUsers.filter(u => u.status === 'Active').length}
              </span>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Follow-up</small>
              <span className="fw-bold text-warning small">
                {sortedUsers.filter(u => u.status === 'Follow-up').length}
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Inline styles for better appearance */}
      <style jsx>{`
        .cursor-pointer:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .sidebar-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
        .bg-gradient {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;