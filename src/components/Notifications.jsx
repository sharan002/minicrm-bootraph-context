import React, { useRef, useEffect, useState } from 'react';

const Notifications = ({ 
  unreadLeads, 
  showNotifications, 
  setShowNotifications, 
  notificationSound, 
  setNotificationSound, 
  browserNotifications, 
  setBrowserNotifications, 
  users, 
  setSelectedUser, 
  markAsRead, 
  markAllAsRead,
  setShowMobileSidebar,
  getLeadSourceIcon
}) => {
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (showNotifications && dropdownRef.current && buttonRef.current) {
      const dropdown = dropdownRef.current;
      const button = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = dropdown.offsetWidth;
      const viewportWidth = window.innerWidth;

      // Calculate position
      const spaceOnRight = viewportWidth - button.right;
      const spaceOnLeft = button.left;

      let style = {
        position: 'absolute',
        top: '110%',
        zIndex: 1050,
        width: '20rem',
        maxWidth: '22rem',
      };

      // If not enough space on the right, align to left
      if (spaceOnRight < dropdownWidth && spaceOnLeft > dropdownWidth) {
        style.left = 0;
      } else {
        style.right = 0;
      }

      setDropdownStyle(style);
    }
  }, [showNotifications]);

  return (
    <div className="position-relative">
      {/* Notification Button */}
      <button
        ref={buttonRef}
        onClick={() => setShowNotifications(!showNotifications)}
        className="btn btn-light position-relative"
      >
        <i className="fas fa-bell fs-5 text-secondary"></i>
        {unreadLeads.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ animation: 'pulse 1.5s infinite' }}
          ></span>
        )}
      </button>

      {/* Dropdown */}
      {showNotifications && (
        <div
          ref={dropdownRef}
          className="dropdown-menu show shadow border-0 rounded fade"
          style={dropdownStyle}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
            <h6 className="mb-0 fw-semibold text-dark">Notifications</h6>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setNotificationSound(!notificationSound)}
                className={`btn btn-sm ${
                  notificationSound ? 'text-primary' : 'text-muted'
                }`}
              >
                <i className="fas fa-bell"></i>
              </button>
              <button
                onClick={() => setBrowserNotifications(!browserNotifications)}
                className={`btn btn-sm ${
                  browserNotifications ? 'text-primary' : 'text-muted'
                }`}
              >
                <i className="fas fa-desktop"></i>
              </button>
              {unreadLeads.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-link btn-sm text-decoration-none text-primary"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-auto" style={{ maxHeight: '24rem' }}>
            {unreadLeads.length > 0 ? (
              unreadLeads.map((leadId) => {
                const lead = users.find((u) => u._id === leadId);
                if (!lead) return null;

                return (
                  <div
                    key={leadId}
                    className="d-flex align-items-start px-3 py-2 border-bottom"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUser(lead);
                      markAsRead(leadId);
                      setShowNotifications(false);
                      if (window.innerWidth < 768) {
                        setShowMobileSidebar(false);
                      }
                    }}
                  >
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle me-3 ${
                        lead.respondedAfterFollowUp
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-primary bg-opacity-10 text-primary'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <i className={getLeadSourceIcon(lead.leadfrom)}></i>
                    </div>

                    <div className="flex-grow-1">
                      <p className="mb-0 fw-semibold text-dark">{lead.userName}</p>
                      <p className="mb-0 small text-secondary">{lead.course}</p>
                      <p className="mb-0 small text-muted">New lead received</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(leadId);
                      }}
                      className="btn btn-sm text-muted"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted py-5">
                <i className="fas fa-bell-slash fs-2 mb-2"></i>
                <p className="mb-0">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
