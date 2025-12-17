import React from 'react';
import { useApp } from '../context/AppContext';
import { getLeadSourceIcon } from '../utils/notificationUtils';

const Sidebar = () => {
  /* 
    Updating filter logic to include new specific filters.
    activeTab still functions as a primary high-level filter.
    Additional filters (dropdowns) act as AND conditions.
  */
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
    setAssignee,
    assignee,
    assigneeList,
    setAssigneeList,
    // New filters
    courseFilter,
    leadSourceFilter,
    pipelineFilter,
    statusFilter,
    programTypeFilter,
    professionFilter,
    assignedToFilter,
    dateCreatedFilter,
    startDate, // keeping for backward compatibility if needed or legacy clean up
    endDate     // keeping for backward compatibility if needed or legacy clean up
  } = useApp();

  const filteredUsers = users.filter((user) => {
    // 1. Existing Active Tab Logic
    if (activeTab !== "all") {
      if (activeTab === "respondedAfterFollowUp") {
        if (!user.respondedAfterFollowUp) return false;
      } else if (user.respondedAfterFollowUp) {
        // If viewing specific source tab, exclude those who responded? (Logic from prev version preserved)
        return false;
      } else if (
        user.leadfrom?.toLowerCase() !== activeTab.toLowerCase()
      ) {
        return false;
      }
    }

    // 2. Search Query Logic
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

    // 3. New Detailed Filters
    if (courseFilter && user.course !== courseFilter) return false;

    if (leadSourceFilter && user.leadfrom !== leadSourceFilter) return false;

    // pipeline: Data has "New" (Title Case), filter has "New".
    if (pipelineFilter && user.pipeline !== pipelineFilter) return false;

    // status: Data has "New", filter option "New". Data also has leadStatus. check both.
    if (statusFilter) {
      const uStatus = user.status || user.leadStatus;
      if (uStatus !== statusFilter) return false;
    }

    // programType: Data has "8 hours" in `programType` (camelCase). My previous code used lowercase `programtype`.
    if (programTypeFilter) {
      const uProg = user.programType || user.programtype;
      if (uProg !== programTypeFilter) return false;
    }

    // profession: Data has "Job seeker". Filter option "Job seeker".
    if (professionFilter && user.profession !== professionFilter) return false;

    // assignedTo: Data has "assignedto" (lowercase). Check both.
    if (assignedToFilter) {
      const uAssign = user.assignedTo || user.assignedto;
      if (uAssign !== assignedToFilter) return false;
    }

    // Date Created Filter (Exact Date Match)
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
    <div className={`${showMobileSidebar ? 'd-block' : 'd-none'} d-md-block h-100 bg-white border-end`}>
      <div className="p-3 border-bottom">
        <h6 className="fw-semibold mb-0 text-dark">
          {sortedUsers.length} {sortedUsers.length === 1 ? 'Lead' : 'Leads'}
        </h6>
      </div>

      <div className="sidebar-content" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-start flex-grow-1">
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle me-3 ${user.respondedAfterFollowUp ? "bg-danger-subtle" : "bg-info-subtle"
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
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
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