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
    startDate,
    endDate,
    searchQuery,
    sortBy,setAssignee ,assignee , assigneeList, setAssigneeList
  } = useApp();

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

    if (startDate || endDate) {
      const userDate = new Date(user.datecreated);
      if (startDate && userDate < new Date(startDate)) return false;
      if (endDate && userDate > new Date(endDate + "T23:59:59"))
        return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.userName?.toLowerCase().includes(query) ||
        user.userNumber?.includes(query) ||
        user.course?.toLowerCase().includes(query) ||
        user.city?.toLowerCase().includes(query)
      );
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
    <div className={`${showMobileSidebar ? 'd-block' : 'd-none'} d-md-block h-100 bg-white border-end`}>
      <div className="p-3 border-bottom">
        <h6 className="fw-semibold mb-0 text-dark">
          {sortedUsers.length} {sortedUsers.length === 1 ? 'Lead' : 'Leads'}
        </h6>
      </div>
      
      <div className="sidebar-content" style={{height: 'calc(100vh - 200px)', overflowY: 'auto'}}>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => (
            <div
              key={user._id || user.userNumber}
              onClick={() => {
                setSelectedUser(user);
                markAsRead(user._id);
                if (window.innerWidth < 768) {
                  setShowMobileSidebar(false);
                }
              }}
              className={`p-3 border-bottom cursor-pointer ${selectedUser?.userNumber === user.userNumber ? 'bg-light border-start border-primary border-3' : ''}`}
              style={{cursor: 'pointer'}}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-start flex-grow-1">
<div
  className={`d-flex align-items-center justify-content-center rounded-circle me-3 ${
    user.respondedAfterFollowUp ? "bg-danger-subtle" : "bg-info-subtle"
  }`}
  style={{
    width: "40px",
    height: "40px",
  }}
>
  {user.respondedAfterFollowUp ? (
    <i
      className="fas fa-fire text-danger"
      style={{ fontSize: "22px", lineHeight: "1" }}
    ></i>
  ) : (
    <i
      className={`${getLeadSourceIcon(user.leadfrom)} text-info`}
      style={{ fontSize: "22px", lineHeight: "1" }}
    ></i>
  )}
</div>
                  <div className="flex-grow-1" style={{minWidth: 0}}>
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="fw-semibold mb-1 text-dark text-truncate">
                        {user.userName}
                      </h6>
                      {unreadLeads.includes(user._id) && (
                        <span className="badge bg-danger ms-2">
                          <i className="fas fa-bolt me-1"></i>New
                        </span>
                      )}
                    </div>
                    <p className="text-muted small mb-1 text-truncate">{user.course}</p>
                    <div className="d-flex align-items-center text-muted small">
                      <span className="text-truncate">{user.leadfrom || "No source"}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(user.datecreated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeadToDelete(user);
                    setShowDeleteConfirm(true);
                  }}
                  className="btn btn-sm btn-outline-danger ms-2"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              
              {user.conversations && user.conversations.length > 0 && (
                <div className="mt-2 text-muted small text-truncate ps-5">
                  {user.conversations[user.conversations.length - 1].userMsg || 
                   user.conversations[user.conversations.length - 1].botReply}
                </div>
              )}
              {/* Assignee Dropdown */}
{/* <div className="mt-2 ps-5">
  <select
    className="form-select form-select-sm"
    value={user.assignedTo || ""}
    onChange={(e) => {
      // update selected user's assignee locally
      const updated = users.map((u) =>
        u.userNumber === user.userNumber
          ? { ...u, assignedTo: e.target.value }
          : u
      );
      setUsers(updated);

      // Optional: Save globally
      setAssignee(e.target.value);
    }}
  >
    <option value="">-- Assign User --</option>

    {assigneeList.map((staff) => (
      <option key={staff.userNumber} value={staff.userNumber}>
        {staff.useremail}
      </option>
    ))}
  </select>
</div> */}

            </div>
          ))
        ) : (
          <div className="text-center p-5 text-muted">
            <i className="fas fa-inbox fs-1 mb-3"></i>
            <p>No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;