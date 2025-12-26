import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const LeadTrackingSidebar = () => {
    const { selectedUser, setSelectedUser, setUsers, setAssignee, assignee, assigneeList } = useApp();

    const [remarks, setRemarks] = useState([]);
    const [newRemark, setNewRemark] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [status, setStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        userName: "",
        userNumber: "",
        location:"",
        course: "",
        leadfrom: "",
        profession: "",
        programType: "",
        status: "",
        pipeline: ""
    });

    const popupRef = useRef(null);

    useEffect(() => {
        if (selectedUser) {
            setRemarks(selectedUser.remarks || []);
            setReminderDate(selectedUser.reminder ? new Date(selectedUser.reminder).toISOString().slice(0, 16) : "");
            setStatus(selectedUser.pipeline || "contacted");
            setAssignee(selectedUser.assignedto || "");

            setEditForm({
                userName: selectedUser.userName || "",
                userNumber: selectedUser.userNumber || "",
                course: selectedUser.course || "",
                leadfrom: selectedUser.leadfrom || "",
                profession: selectedUser.profession || "",
                programType: selectedUser.programType || "",
                location : selectedUser.location || "",
                status: selectedUser.status || "",
                pipeline: selectedUser.pipeline || ""
            });
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
            }
        } catch (err) {
            console.error("Error deleting remark:", err);
        }
    };

    const autoSave = async (updatedData = {}) => {
        setIsSaving(true);
        try {
            const res = await fetch("http://localhost:3000/Users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: selectedUser._id,
                    status: status,
                    assignedto: assignee,
                    reminder: reminderDate || null,
                    ...updatedData
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                updateGlobalState(updatedUser);
                console.log("Auto-saved");
            }
        } catch (err) {
            console.error("Error auto saving");
        } finally {
            setIsSaving(false);
        }
    };

    // ------------------------------------------------------
    //  VALIDATION BEFORE POPUP SAVE (NEW)
    // ------------------------------------------------------
    const handleEditSave = async () => {
        const requiredFields = ["userName", "course", "leadfrom", "profession", "programType", "status", "pipeline","location"];

        for (let field of requiredFields) {
            if (!editForm[field] || editForm[field].trim() === "") {
                alert(`Please fill the '${field}' field before saving.`);
                return; // STOP SAVE
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

    // ------------------------------------------------------
    // CLOSE POPUP ON OUTSIDE CLICK (NEW)
    // ------------------------------------------------------
    const handlePopupBackgroundClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
            setIsEditPopupOpen(false);
        }
    };

    if (!selectedUser) return null;

    return (
        <>
            <div className="h-100 bg-white border-start overflow-auto" style={{ width: '350px', minWidth: '300px' }}>
                <div className="p-3 border-bottom d-flex justify-content-between">
                    <h5 className="mb-0">Lead Tracking</h5>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setIsEditPopupOpen(true)}
                    >
                        Edit Lead Details
                    </button>
                </div>

                <div className="p-3">

                    {/* Remarks */}
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

                    {/* Reminder */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Date to Notify</label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={reminderDate}
                            onChange={(e) => {
                                setReminderDate(e.target.value);
                                autoSave({ reminder: e.target.value });
                            }}
                        />
                    </div>

                    {/* Status */}
                    {/* <div className="mb-4">
                        <label className="form-label fw-semibold">Lead Status</label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                autoSave({ status: e.target.value });
                            }}
                        >
                            <option value="contacted">Contacted</option>
                            <option value="joined">Joined</option>
                            <option value="sent-message">Sent Message</option>
                        </select>
                    </div> */}

                    {/* Assignee */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Assignee</label>
                        <select
                            className="form-select"
                            value={assignee}
                            onChange={(e) => {
                                setAssignee(e.target.value);
                                autoSave({ assignedto: e.target.value });
                            }}
                        >
                            <option value="">-- Select User --</option>
                            {assigneeList.map((u, i) => (
                                <option key={i} value={u.userNumber}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* EDIT POPUP */}
            {isEditPopupOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
                    onClick={handlePopupBackgroundClick}  // NEW
                >
                    <div
                        ref={popupRef}  // NEW
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
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                            onChange={(e) => setEditForm({ ...editForm, pipeline: e.target.value })}
                        >
                            <option value="">Select Pipeline</option>
                            <option>New</option>
                            <option>Contacted</option>
                            <option>Asked Time</option>
                            <option>Not intrested</option>
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
        </>
    );
};

export default LeadTrackingSidebar;
