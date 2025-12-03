import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const LeadTrackingSidebar = () => {
    const { selectedUser, setSelectedUser, setUsers } = useApp();
    const [remarks, setRemarks] = useState([]);
    const [newRemark, setNewRemark] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [status, setStatus] = useState("contacted");
    const [assignee, setAssignee] = useState("user1");
    const [isSaving, setIsSaving] = useState(false);

    // Load initial data when selectedUser changes
    useEffect(() => {
        if (selectedUser) {
            setRemarks(selectedUser.remarks || []);
            setReminderDate(selectedUser.reminder ? new Date(selectedUser.reminder).toISOString().slice(0, 16) : "");
            setStatus(selectedUser.status || "contacted");
            setAssignee(selectedUser.assignedto || "user1");
        }
    }, [selectedUser]);

    const updateGlobalState = (updatedUser) => {
        setSelectedUser(updatedUser);
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    };

    const handleAddRemark = async () => {
        if (newRemark.trim()) {
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
                } else {
                    console.error("Failed to add remark");
                }
            } catch (err) {
                console.error("Error adding remark:", err);
            }
        }
    };

    const handleDeleteRemark = async (remarkId) => {
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
            } else {
                console.error("Failed to delete remark");
            }
        } catch (err) {
            console.error("Error deleting remark:", err);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("http://localhost:3000/Users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: selectedUser._id,
                    status: status,
                    assignedto: assignee,
                    reminder: reminderDate || null
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                updateGlobalState(updatedUser);
                alert("Lead details saved successfully!");
            } else {
                console.error("Failed to save lead details");
                alert("Failed to save details.");
            }
        } catch (err) {
            console.error("Error saving lead details:", err);
            alert("Error saving details.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedUser) return null;

    return (
        <div className="h-100 bg-white border-start overflow-auto" style={{ width: '350px', minWidth: '300px' }}>
            <div className="p-3 border-bottom">
                <h5 className="mb-0">Lead Tracking</h5>
            </div>

            <div className="p-3">
                {/* Remarks Section */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">Remarks</label>
                    <div className="list-group mb-2">
                        {remarks.map((remark) => (
                            <div key={remark._id || remark.id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                                <small>{remark.remark || remark.text}</small>
                                <button
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => handleDeleteRemark(remark._id || remark.id)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                        {remarks.length === 0 && <div className="text-muted small fst-italic">No remarks yet</div>}
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
                        <button className="btn btn-outline-secondary" onClick={handleAddRemark}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                {/* Date to Notify */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">Date to Notify</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                    />
                </div>

                {/* Lead Status */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">Lead Status</label>
                    <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="contacted">Contacted</option>
                        <option value="joined">Joined</option>
                        <option value="sent-message">Sent Message</option>
                    </select>
                </div>

                {/* Assignee */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">Assignee</label>
                    <select
                        className="form-select"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                    >
                        <option value="user1">User 1</option>
                        <option value="user2">User 2</option>
                    </select>
                </div>

                {/* Save Button */}
                <div className="d-grid">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Details'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadTrackingSidebar;
