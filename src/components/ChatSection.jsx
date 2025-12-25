import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getLeadSourceIcon } from '../utils/notificationUtils';

// Date utility functions
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDateWithTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatRemarkDate = (timestamp) =>
  new Date(timestamp?.$date || timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const groupMessagesByDate = (messages) => {
  if (!messages || messages.length === 0) return [];
  
  const groups = [];
  let currentGroup = null;
  
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  sortedMessages.forEach((message) => {
    if (!message.timestamp) return;
    
    const messageDate = new Date(message.timestamp);
    const dateString = messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const today = new Date();
    const isToday = 
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = 
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();
    
    let dateLabel = dateString;
    if (isToday) dateLabel = 'Today';
    else if (isYesterday) dateLabel = 'Yesterday';
    
    if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
      currentGroup = {
        dateLabel,
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
};

const ChatSection = () => {
  const {
    selectedUser,
    setSelectedUser,
    setUsers,
    setAssignee,
    assignee,
    assigneeList,
    setShowDeleteConfirm,
    setLeadToDelete,
    setShowMobileSidebar,
    messagesEndRef
  } = useApp();

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead Tracking State
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState("");
  const [reminderDate, setReminderDate] = useState("");
const [status, setStatus] = useState("");
const [pipeline, setPipeline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: "",
    userNumber: "",
    location: "",
    course: "",
    leadfrom: "",
    profession: "",
    programType: "",
    status: "",
    pipeline: ""
  });

  const chatContainerRef = useRef(null);
  const popupRef = useRef(null);

  // Initialize lead tracking data when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setRemarks(selectedUser.remarks || []);
      setReminderDate(selectedUser.reminder ? new Date(selectedUser.reminder).toISOString().slice(0, 16) : "");
         setStatus(selectedUser.status || "Cold");
    setPipeline(selectedUser.pipeline || "New");
      setAssignee(selectedUser.assignedto || "");
 setStatus(selectedUser.pipeline || "");
      setEditForm({
        userName: selectedUser.userName || "",
        userNumber: selectedUser.userNumber || "",
        course: selectedUser.course || "",
        leadfrom: selectedUser.leadfrom || "",
        profession: selectedUser.profession || "",
        programType: selectedUser.programType || "",
        location: selectedUser.location || "",
        status: selectedUser.status || "",
        pipeline: selectedUser.pipeline || ""
      });
    }
  }, [selectedUser]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [selectedUser?.conversations]);

  const updateGlobalState = (updatedUser) => {
    setSelectedUser(updatedUser);
    setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
  };

  const handleAddRemark = async () => {
    if (newRemark.trim() && selectedUser) {
      try {
        const res = await fetch("http://localhost:3000/Users/remarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: selectedUser._id,
            remark: newRemark
          })
        });

        if (res.ok) {
          const updatedUser = await res.json();
          setRemarks(updatedUser.remarks);
          setNewRemark("");
          updateGlobalState(updatedUser);
        }
      } catch (err) {
        console.error("Error adding remark:", err);
      }
    }
  };

  const handleDeleteRemark = async (remarkId) => {
    if (selectedUser) {
      try {
        const res = await fetch("http://localhost:3000/Users/remarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: selectedUser._id,
            remarkId: remarkId
          })
        });

        if (res.ok) {
          const updatedUser = await res.json();
          setRemarks(updatedUser.remarks);
          updateGlobalState(updatedUser);
        }
      } catch (err) {
        console.error("Error deleting remark:", err);
      }
    }
  };

  const autoSave = async (updatedData = {}) => {
    if (!selectedUser) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3000/Users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
_id: selectedUser._id,
        // status,
        pipeline,
        assignedto: assignee,
        reminder: reminderDate || null,
        ...updatedData
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        updateGlobalState(updatedUser);
      }
    } catch (err) {
      console.error("Error auto saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    
    const requiredFields = ["userName", "course", "leadfrom", "profession", "programType", "status", "pipeline", "location"];

    for (let field of requiredFields) {
      if (!editForm[field] || editForm[field].trim() === "") {
        alert(`Please fill the '${field}' field before saving.`);
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:3000/Users/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedUser._id,
          ...editForm,
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        updateGlobalState(updatedUser);
        setIsEditPopupOpen(false);
        alert("Lead data updated!");
      }
    } catch (err) {
      console.error("Popup save error:", err);
    }
  };

  const handlePopupBackgroundClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setIsEditPopupOpen(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    const statusMap = {
      'Hot': 'danger',
      'Warm': 'warning',
      'Cold': 'info',
      'Active': 'success',
      'Pending': 'warning',
      'Closed': 'secondary',
      'Follow-up': 'info'
    };
    return statusMap[status] || 'secondary';
  };

  const getPipelineColor = (pipeline) => {
    if (!pipeline) return 'secondary';
    const pipelineMap = {
      'New': 'info',
      'Qualified': 'success',
      'Proposal': 'warning',
      'Negotiation': 'primary',
      'Closed': 'secondary',
      'Contacted': 'primary',
      'Asked Time': 'warning',
      'Not interested': 'danger'
    };
    return pipelineMap[pipeline] || 'secondary';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      setIsTyping(true);
      setTimeout(() => {
        console.log('Sending message:', messageInput);
        setMessageInput('');
        setIsTyping(false);
        
        if (chatContainerRef.current) {
          setTimeout(() => {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }, 100);
        }
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const messageGroups = selectedUser ? groupMessagesByDate(selectedUser.conversations || []) : [];

  if (!selectedUser) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-muted p-5 h-100" 
           style={{ background: 'linear-gradient(135deg, #667eea0d 0%, #764ba20d 100%)' }}>
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <div className="avatar-placeholder bg-gradient-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4"
              style={{ width: '120px', height: '120px' }}>
              <i className="fas fa-comments fa-3x text-primary"></i>
            </div>
          </div>
        </div>
        <h4 className="fw-semibold mb-3 text-dark">Welcome to Lead Management</h4>
        <p className="text-center text-muted mb-4" style={{ maxWidth: '500px' }}>
          Select a lead from the sidebar to view conversations, manage follow-ups, and track progress
        </p>
        <div className="mt-4 d-flex flex-wrap justify-content-center gap-3">
          <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-white shadow-sm" style={{ width: '140px' }}>
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-2">
              <i className="fas fa-message fa-lg"></i>
            </div>
            <span className="fw-semibold small">Send Messages</span>
          </div>
          <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-white shadow-sm" style={{ width: '140px' }}>
            <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-2">
              <i className="fas fa-history fa-lg"></i>
            </div>
            <span className="fw-semibold small">View History</span>
          </div>
          <div className="d-flex flex-column align-items-center p-3 rounded-3 bg-white shadow-sm" style={{ width: '140px' }}>
            <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 mb-2">
              <i className="fas fa-chart-line fa-lg"></i>
            </div>
            <span className="fw-semibold small">Track Leads</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex h-100 position-relative">
      {/* User Details Panel with Lead Tracking */}
      {showUserDetails && (
        <div className="user-details-panel position-absolute position-md-relative z-index-1020 bg-white h-100 border-start shadow"
          style={{ width: '380px', zIndex: 1020, right: 0 }}>
          <div className="h-100 d-flex flex-column">
            {/* Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center">
                <button 
                  onClick={() => setShowUserDetails(false)}
                  className="btn btn-sm btn-outline-secondary me-2 d-md-none"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <h6 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-user-circle me-2 text-primary"></i>
                  Lead Details
                </h6>
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => setIsEditPopupOpen(true)}
                  title="Edit Lead Details"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  onClick={() => setShowUserDetails(false)}
                  className="btn btn-sm btn-outline-secondary d-none d-md-block"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow-1 overflow-auto p-3">
              {/* Profile Section */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block mb-3">
                  <div className="avatar-details bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                    style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-user fa-2x"></i>
                  </div>
                  <span className={`position-absolute bottom-0 end-0 badge bg-${getStatusColor(selectedUser.status)} border border-2 border-white`}
                    style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px' }}>
                    {selectedUser.followUpCount || 0}
                  </span>
                </div>
                <h5 className="fw-bold mb-1">{selectedUser.userName}</h5>
                <p className="text-muted mb-3">
                  <i className="fas fa-phone-alt me-1"></i>
                  {selectedUser.userNumber}
                </p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <span className={`badge bg-${getStatusColor(selectedUser.status)} bg-opacity-10 text-${getStatusColor(selectedUser.status)} border border-${getStatusColor(selectedUser.status)} border-opacity-25`}>
                    {selectedUser.status || 'Cold'}
                  </span>
                  <span className={`badge bg-${getPipelineColor(selectedUser.pipeline)} bg-opacity-10 text-${getPipelineColor(selectedUser.pipeline)} border border-${getPipelineColor(selectedUser.pipeline)} border-opacity-25`}>
                    {selectedUser.pipeline || 'New'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div className="card border-0 bg-primary bg-opacity-5 text-center p-2 rounded-3">
                    <div className="text-white fw-bold fs-5">{selectedUser.followUpCount || 0}</div>
                    <small className="text-white">Follow-ups</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card border-0 bg-success bg-opacity-5 text-center p-2 rounded-3">
                    <div className="text-white fw-bold fs-5">{selectedUser.conversations?.length || 0}</div>
                    <small className="text-white">Messages</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card border-0 bg-info bg-opacity-5 text-center p-2 rounded-3">
                    <div className="text-white fw-bold fs-5">{selectedUser.remarks?.length || 0}</div>
                    <small className="text-white">Remarks</small>
                  </div>
                </div>
{selectedUser.remarks?.map((item, index) => (
  <div key={item._id || index} className="mb-2">
    <div className="fw-medium">{item.remark}</div>
    <small className="text-muted">
      {new Date(item.timestamp).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })}
    </small>
  </div>
))}

                
              </div>

              {/* Lead Information */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3 text-dark">
                  <i className="fas fa-info-circle me-2 text-muted"></i>
                  Lead Information
                </h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className="fas fa-graduation-cap me-2"></i>Course
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.course || 'N/A'}</span>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className="fas fa-briefcase me-2"></i>Profession
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.profession || 'N/A'}</span>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className="fas fa-clock me-2"></i>Program Type
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.programType || 'N/A'}</span>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className="fas fa-map-marker-alt me-2"></i>Location
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.location || 'N/A'}</span>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className={`${getLeadSourceIcon(selectedUser.leadfrom)} me-2`}></i>Lead Source
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.leadfrom || 'N/A'}</span>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <span className="text-muted d-flex align-items-center">
                      <i className="fas fa-user-tag me-2"></i>Assigned To
                    </span>
                    <span className="fw-semibold text-end">{selectedUser.assignedto || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Lead Tracking Section */}
              <div className="lead-tracking-section">
                {/* Remarks */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3 text-dark">
                    <i className="fas fa-sticky-note me-2 text-muted"></i>
                    Remarks
                  </h6>
<div
  className="list-group mb-2"
  style={{ maxHeight: '150px', overflowY: 'auto' }}
>
  {remarks.map((remark) => (
    <div
      key={remark._id || remark.id}
      className="list-group-item d-flex justify-content-between align-items-center p-2 mb-1"
    >
      {/* LEFT SIDE (text only, stacked — no UI impact) */}
      <div className="d-flex flex-column">
        <small className="text-break">
          {remark.remark || remark.text}
        </small>
        <small className="text-muted" style={{ fontSize: '11px' }}>
          {formatRemarkDate(remark.timestamp)}
        </small>
      </div>

      {/* RIGHT SIDE (unchanged) */}
      <button
        className="btn btn-link text-danger p-0 ms-2 flex-shrink-0"
        onClick={() => handleDeleteRemark(remark._id || remark.id)}
        style={{ fontSize: '12px' }}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  ))}

  {remarks.length === 0 && (
    <div className="text-muted small fst-italic p-2">
      No remarks yet
    </div>
  )}
</div>


                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a remark..."
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRemark()}
                    />
                    <button className="btn btn-outline-primary" onClick={handleAddRemark} disabled={!newRemark.trim()}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Reminder */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3 text-dark">
                    <i className="fas fa-bell me-2 text-muted"></i>
                    Date to Notify
                  </h6>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm"
                    value={reminderDate}
                    onChange={(e) => {
                      setReminderDate(e.target.value);
                      autoSave({ reminder: e.target.value });
                    }}
                  />
                </div>

                {/* Assignee */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3 text-dark">
                    <i className="fas fa-user-tie me-2 text-muted"></i>
                    Assignee
                  </h6>
                  <select
                    className="form-select form-select-sm"
                    value={assignee}
                    onChange={(e) => {
                      setAssignee(e.target.value);
                      autoSave({ assignedto: e.target.value });
                    }}
                  >
                    <option value="">-- Select User --</option>
                    {assigneeList.map((u, i) => (
                      <option key={i} value={u.userNumber}>{u.useremail}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3 text-dark">
                    <i className="fas fa-chart-line me-2 text-muted"></i>
                    Pipeline Status
                  </h6>
<select
  className="form-select form-select-sm"
  value={pipeline}
  onChange={(e) => {
    setPipeline(e.target.value);
    autoSave({ pipeline: e.target.value });
  }}
>
  <option value="New">New</option>
  <option value="Contacted">Contacted</option>
  <option value="Asked Time">Asked Time</option>
  <option value="Not interested">Not interested</option>
</select>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3 text-dark">
                  <i className="fas fa-history me-2 text-muted"></i>
                  Timeline
                </h6>
                <div className="ps-3 border-start border-2 border-primary">
                  <div className="mb-3 position-relative">
                    <div className="position-absolute start-0 top-0 translate-middle">
                      <div className="bg-primary rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                    </div>
                    <div className="ms-4">
                      <small className="text-muted d-block">Created</small>
                      <span className="fw-semibold d-block">{formatDate(selectedUser.datecreated)}</span>
                      <small className="text-muted">{formatMessageTime(selectedUser.datecreated)}</small>
                    </div>
                  </div>
                  {selectedUser.lastInteracted && (
                    <div className="mb-3 position-relative">
                      <div className="position-absolute start-0 top-0 translate-middle">
                        <div className="bg-success rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                      </div>
                      <div className="ms-4">
                        <small className="text-muted d-block">Last Interaction</small>
                        <span className="fw-semibold d-block">{formatDate(selectedUser.lastInteracted)}</span>
                        <small className="text-muted">{formatMessageTime(selectedUser.lastInteracted)}</small>
                      </div>
                    </div>
                  )}
                  {selectedUser.reminder && (
                    <div className="mb-3 position-relative">
                      <div className="position-absolute start-0 top-0 translate-middle">
                        <div className="bg-warning rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                      </div>
                      <div className="ms-4">
                        <small className="text-muted d-block">Next Reminder</small>
                        <span className="fw-semibold d-block">{formatDate(selectedUser.reminder)}</span>
                        <small className="text-muted">{formatMessageTime(selectedUser.reminder)}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-top bg-light">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={() => {
                  setShowUserDetails(false);
                  setTimeout(() => {
                    const input = document.querySelector('.message-input');
                    if (input) input.focus();
                  }, 100);
                }}
              >
                <i className="fas fa-comments me-2"></i>
                Continue Chatting
              </button>
              <button 
                className="btn btn-outline-danger w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setLeadToDelete(selectedUser);
                  setShowDeleteConfirm(true);
                  setShowUserDetails(false);
                }}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`d-flex flex-column flex-grow-1 h-100 bg-white ${showUserDetails ? 'd-none d-md-flex' : ''}`}>
        {/* Enhanced Header */}
        <div className="p-3 border-bottom shadow-sm bg-gradient-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
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
              
              <div className="d-flex align-items-center flex-grow-1">
                {/* Avatar */}
                <div className="position-relative me-3">
                  <div className="avatar-chat bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                    style={{ width: "50px", height: "50px" }}>
                    <i className="fas fa-user fa-lg"></i>
                  </div>
                  <span className="position-absolute bottom-0 end-0 badge bg-success border border-2 border-white"
                    style={{ width: '14px', height: '14px', padding: 0, borderRadius: '50%' }}>
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <h5 className="fw-bold mb-0 text-dark me-2">{selectedUser.userName}</h5>
                    <span className={`badge bg-${getStatusColor(selectedUser.status)} bg-opacity-10 text-${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status || 'Cold'}
                    </span>
                    <span className={`badge bg-${getPipelineColor(selectedUser.pipeline)} bg-opacity-10 text-${getPipelineColor(selectedUser.pipeline)} ms-2`}>
                      {selectedUser.pipeline || 'New'}
                    </span>
                    <span className="badge bg-warning bg-opacity-10 text-warning ms-2">
                      <i className="fas fa-flag me-1"></i>
                      {selectedUser.followUpCount || 0}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap align-items-center text-muted small">
                    <span className="me-3 d-flex align-items-center">
                      <i className="fas fa-graduation-cap me-1"></i>
                      {selectedUser.course || "No course"}
                    </span>
                    <span className="me-3 d-flex align-items-center">
                      <i className={`${getLeadSourceIcon(selectedUser.leadfrom)} me-1`}></i>
                      {selectedUser.leadfrom}
                    </span>
                    <span className="me-3 d-flex align-items-center">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {selectedUser.location || 'NA'}
                    </span>
                    <span className="me-3 d-flex align-items-center">
                      <i className="fas fa-calendar-alt me-1"></i>
                      {formatDate(selectedUser.datecreated)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex align-items-center">
              {/* Quick Lead Edit Button */}
              <button
                onClick={() => setIsEditPopupOpen(true)}
                className="btn btn-outline-primary btn-sm me-2"
                title="Edit Lead Details"
              >
                <i className="fas fa-edit me-1 d-none d-md-inline"></i>
                <span className="d-none d-md-inline">Edit</span>
                <i className="fas fa-edit d-md-none"></i>
              </button>
              
              {/* Details Toggle Button */}
              <button 
                onClick={() => setShowUserDetails(!showUserDetails)}
                className="btn btn-outline-info btn-sm me-2 d-md-none"
                title="Show Details"
              >
                <i className="fas fa-info-circle"></i>
              </button>
              
              <button 
                onClick={() => setShowUserDetails(!showUserDetails)}
                className="btn btn-outline-info btn-sm me-2 d-none d-md-block"
                title="Show Details"
              >
                <i className="fas fa-info-circle me-1"></i> Details
              </button>
              
              <button className="btn btn-outline-success btn-sm me-2" title="Call">
                <i className="fas fa-phone-alt"></i>
              </button>
              <button className="btn btn-outline-info btn-sm me-2" title="Email">
                <i className="fas fa-envelope"></i>
              </button>
              <button
                onClick={() => {
                  setLeadToDelete(selectedUser);
                  setShowDeleteConfirm(true);
                }}
                className="btn btn-outline-danger btn-sm"
                title="Delete Lead"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-grow-1 overflow-auto p-3 p-md-4 bg-chat"
          style={{ 
            background: 'linear-gradient(135deg, #667eea0d 0%, #764ba20d 100%)',
            position: 'relative'
          }}
        >
          {messageGroups.length > 0 ? (
            <>
              {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  {/* Date Separator */}
                  <div className="text-center my-4 position-relative">
                    <div className="d-inline-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm border">
                      <i className="fas fa-calendar-day me-2 text-primary"></i>
                      <span className="fw-medium text-dark">{group.dateLabel}</span>
                    </div>
                  </div>

                  {/* Messages */}
                  {group.messages.map((message, msgIndex) => (
                    <React.Fragment key={msgIndex}>
                      {/* User Message */}
                      {message.userMsg && (
                        <div className="d-flex justify-content-start mb-3">
                          <div className="d-flex align-items-start" style={{ maxWidth: '80%' }}>
                            {/* User Avatar */}
                            <div className="flex-shrink-0 me-3">
                              <div className="user-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}>
                                <i className="fas fa-user"></i>
                              </div>
                            </div>
                            {/* Message Bubble */}
                            <div>
                              <div className="bg-white border rounded-3 p-3 shadow-sm position-relative message-bubble-user">
                                <p className="mb-2 text-dark" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {message.userMsg}
                                </p>
                                <small className="text-muted d-flex align-items-center">
                                  <i className="fas fa-clock me-1"></i>
                                  {formatMessageTime(message.timestamp)}
                                </small>
                              </div>
                              <small className="text-muted ms-4 mt-1 d-block">
                                {selectedUser.userName}
                              </small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bot Message */}
                      {message.botReply && (
                        <div className="d-flex justify-content-end mb-3">
                          <div className="d-flex align-items-start flex-row-reverse" style={{ maxWidth: '80%' }}>
                            {/* Bot Avatar */}
                            <div className="flex-shrink-0 ms-3">
                              <div className="bot-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                                style={{ width: '38px', height: '38px' }}>
                                <i className="fas fa-robot"></i>
                              </div>
                            </div>
                            {/* Message Bubble */}
                            <div>
                              <div className="bg-primary text-white rounded-3 p-3 shadow position-relative message-bubble-bot">
                                <p className="mb-2" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {message.botReply}
                                </p>
                                <small className="text-white-50 d-flex align-items-center justify-content-end">
                                  <i className="fas fa-clock me-1"></i>
                                  {formatMessageTime(message.timestamp)}
                                </small>
                              </div>
                              <small className="text-muted text-end me-4 mt-1 d-block">
                                <i className="fas fa-robot me-1"></i>Minmini AI Assistant
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="d-flex align-items-start" style={{ maxWidth: '80%' }}>
                    <div className="flex-shrink-0 me-3">
                      <div className="bot-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                        style={{ width: '38px', height: '38px' }}>
                        <i className="fas fa-robot"></i>
                      </div>
                    </div>
                    <div className="bg-primary text-white rounded-3 p-3 shadow position-relative message-bubble-bot">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
              <div className="text-center mb-4">
                <div className="empty-chat-icon bg-gradient-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
                  style={{ width: '100px', height: '100px' }}>
                  <i className="fas fa-comments fa-2x text-primary"></i>
                </div>
                <h5 className="fw-semibold mb-2 text-dark">Start a conversation</h5>
                <p className="text-muted mb-4" style={{ maxWidth: '500px' }}>
                  No messages yet with {selectedUser.userName}. Send a welcome message to begin the conversation.
                </p>
                <div className="row g-3 justify-content-center">
                  <div className="col-auto">
                    <button className="btn btn-outline-primary" onClick={() => setMessageInput("Hi, I'm from Appin Technology. How can I help you today?")}>
                      <i className="fas fa-handshake me-2"></i>Greet
                    </button>
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-success" onClick={() => setMessageInput("Can you tell me more about your requirements?")}>
                      <i className="fas fa-question-circle me-2"></i>Ask
                    </button>
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-info" onClick={() => setMessageInput("Would you like to schedule a call to discuss the course details?")}>
                      <i className="fas fa-phone-alt me-2"></i>Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="p-3 bg-white border-top shadow-sm">
          <form onSubmit={handleSendMessage} className="message-form">
            <div className="input-group">
              <button type="button" className="btn btn-outline-secondary border-end-0 rounded-start-pill ps-3">
                <i className="fas fa-paperclip"></i>
              </button>
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Type a message to ${selectedUser.userName}...`}
                className="form-control border-0 message-input"
                rows="1"
                style={{ 
                  resize: 'none',
                  minHeight: '45px',
                  maxHeight: '120px'
                }}
              />
              <div className="input-group-append">
                <button type="button" className="btn btn-outline-secondary border-start-0 me-2">
                  <i className="fas fa-smile"></i>
                </button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!messageInput.trim()}>
                  <i className="fas fa-paper-plane me-2"></i>
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* EDIT POPUP (From Lead Tracking) */}
      {isEditPopupOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          onClick={handlePopupBackgroundClick}
        >
          <div
            ref={popupRef}
            className="bg-white p-4 rounded shadow"
            style={{
              width: 420,
              maxHeight: "85vh",
              overflowY: "auto"
            }}
          >
            <h5 className="mb-3">Edit Lead Details</h5>

            {/* Name */}
            <label className="form-label fw-semibold mt-3">Name</label>
            <input
              className="form-control"
              value={editForm.userName}
              onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
            />

            {/* Number */}
            <label className="form-label fw-semibold mt-3">Number</label>
            <input
              className="form-control"
              value={editForm.userNumber}
              disabled
              style={{ background: "#e9ecef", cursor: "not-allowed" }}
            />
            
            {/* location */}
            <label className="form-label fw-semibold mt-3">Location</label>
            <input
              className="form-control"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />

            {/* COURSE */}
            <label className="form-label fw-semibold">Course</label>
            <select
              className="form-select"
              value={editForm.course}
              onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
            >
              <option value="">Select Course</option>
              <option>Python Fullstack with AI</option>
              <option>Java Fullstack with AI</option>
              <option>MERN Stack with AI</option>
              <option>Data Science</option>
              <option>Data Analytics</option>
              <option>Digital Marketing</option>
            </select>

            {/* Program Type */}
            <label className="form-label fw-semibold mt-3">Program Type</label>
            <select
              className="form-select"
              value={editForm.programType || ""}
              onChange={(e) => setEditForm({ ...editForm, programType: e.target.value })}
            >
              <option value="">Select Type</option>
              <option>8 hours</option>
              <option>2 hours</option>
            </select>

            {/* Profession */}
            <label className="form-label fw-semibold mt-3">Profession</label>
            <select
              className="form-select"
              value={editForm.profession || ""}
              onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
            >
              <option value="">Select Profession</option>
              <option>Job seeker</option>
              <option>Student</option>
              <option>Working profession</option>
            </select>

            {/* Source */}
            <label className="form-label fw-semibold mt-3">Source</label>
            <select
              className="form-select"
              value={editForm.leadfrom}
              onChange={(e) => setEditForm({ ...editForm, leadfrom: e.target.value })}
            >
              <option value="">Select Source</option>
              <option>Whatsapp</option>
              <option>Metaads</option>
              <option>Website</option>
              <option>Manual</option>
            </select>

            {/* Status */}
            <label className="form-label fw-semibold mt-3">Status</label>
<select
  className="form-select"
  value={editForm.status || ""}
  onChange={(e) =>
    setEditForm({ ...editForm, status: e.target.value })
  }
>
  <option value="">Select Status</option>
  <option>Hot</option>
  <option>Warm</option>
  <option>Cold</option>
</select>

            {/* Pipeline */}
            <label className="form-label fw-semibold mt-3">Pipeline</label>
<select
  className="form-select"
  value={editForm.pipeline || ""}
  onChange={(e) =>
    setEditForm({ ...editForm, pipeline: e.target.value })
  }
>
  <option value="">Select Pipeline</option>
  <option>New</option>
  <option>Contacted</option>
  <option>Asked Time</option>
  <option>Not interested</option>
</select>


            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setIsEditPopupOpen(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Styles */}
      <style jsx="true">{`
        .avatar-chat {
          transition: all 0.3s ease;
        }
        .avatar-chat:hover {
          transform: scale(1.05);
        }
        .user-avatar, .bot-avatar {
          transition: all 0.3s ease;
        }
        .user-avatar:hover {
          background-color: rgba(13, 110, 253, 0.2) !important;
        }
        .bot-avatar:hover {
          transform: rotate(5deg);
        }
        .message-bubble-user {
          border-top-left-radius: 4px !important;
        }
        .message-bubble-bot {
          border-top-right-radius: 4px !important;
        }
        .bg-chat {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 transparent;
        }
        .bg-chat::-webkit-scrollbar {
          width: 6px;
        }
        .bg-chat::-webkit-scrollbar-track {
          background: transparent;
        }
        .bg-chat::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 3px;
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-5px);
          }
        }
        .empty-chat-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .user-details-panel {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @media (max-width: 768px) {
          .user-details-panel {
            width: 100% !important;
          }
        }
        .bg-gradient-light {
          background: linear-gradient(135deg, #667eea0d 0%, #764ba20d 100%);
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .lead-tracking-section {
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ChatSection;