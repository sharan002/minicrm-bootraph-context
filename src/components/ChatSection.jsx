import React from 'react';
import { useApp } from '../context/AppContext';
import { formatMessageTime, groupMessagesByDate } from '../utils/dateUtils';
import { getLeadSourceIcon } from '../utils/notificationUtils';

const ChatSection = () => {
  const {
    selectedUser,
    setSelectedUser,
    setShowDeleteConfirm,
    setLeadToDelete,
    setShowMobileSidebar,
    messagesEndRef
  } = useApp();

  const messageGroups = selectedUser ? groupMessagesByDate(selectedUser.conversations || []) : [];

  if (!selectedUser) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-muted p-5 h-100">
        <i className="fas fa-user-circle fs-1 mb-3"></i>
        <h4 className="fw-medium mb-2">Select a lead to view details</h4>
        <p className="text-center">Choose a lead from the sidebar to see conversations and details.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <div className="p-3 bg-white border-bottom shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button 
              onClick={() => {
                setShowMobileSidebar(true);
                if (window.innerWidth >= 768) {
                  setSelectedUser(null);
                }
              }}
              className="btn btn-outline-secondary btn-sm me-3 d-md-none"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
<div
  className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center`}
  style={{
    width: "40px", // adjust as needed
    height: "40px",
    backgroundColor: "#f0f0f0", // optional for visibility
  }}
>
  <i
    className={`${getLeadSourceIcon(selectedUser.leadfrom)}`}
    style={{ fontSize: "20px" }} // scales the icon
  ></i>
</div>
            <div>
              <h5 className="fw-semibold mb-1 text-dark">{selectedUser.userName}</h5>
              <div className="d-flex flex-wrap text-muted small">
                <span className="me-3">{selectedUser.course || "No course info"}</span>
                <span className="me-3">{selectedUser.userNumber}</span>
                <span>{selectedUser.city || "No location"}</span>
              </div>
            </div>
          </div>
          <div className="d-flex">
            <button className="btn btn-outline-secondary btn-sm me-2">
              <i className="fas fa-phone-alt"></i>
            </button>
            <button className="btn btn-outline-secondary btn-sm me-2">
              <i className="fas fa-envelope"></i>
            </button>
            <button
              onClick={() => {
                setLeadToDelete(selectedUser);
                setShowDeleteConfirm(true);
              }}
              className="btn btn-outline-danger btn-sm"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow-1 p-4 overflow-auto">
        {messageGroups.length > 0 ? (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <div className="text-center my-4">
                <span className="badge bg-secondary px-3 py-2">
                  {group.dateLabel}
                </span>
              </div>
              
              {group.messages.map((message, msgIndex) => (
                <div key={msgIndex} className="mb-3">
                  {message.userMsg && (
                    <div className="d-flex justify-content-start mb-2">
                      <div className="bg-light border rounded p-3" style={{maxWidth: '70%'}}>
                        <p className="mb-1 text-dark">{message.userMsg}</p>
                        <small className="text-muted text-end d-block">
                          {formatMessageTime(message.timestamp)}
                        </small>
                      </div>
                    </div>
                  )}
                  {message.botReply && (
                    <div className="d-flex justify-content-end mb-2">
                      <div className="bg-primary text-white rounded p-3" style={{maxWidth: '70%'}}>
                        <p className="mb-1">{message.botReply}</p>
                        <small className="text-white-50 text-end d-block">
                          {formatMessageTime(message.timestamp)}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
            <i className="fas fa-comments fs-1 mb-3"></i>
            <p className="fs-5">No conversations yet</p>
            <p className="text-muted">Start a conversation with this lead</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-top">
        <div className="input-group">
          <input
            type="text"
            placeholder="Type a message..."
            className="form-control"
          />
          <button className="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;