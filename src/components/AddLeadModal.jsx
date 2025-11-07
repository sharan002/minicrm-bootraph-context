import React from 'react';
import { useApp } from '../context/AppContext';

const AddLeadModal = () => {
  const {
    showModal,
    setShowModal,
    formData,
    setFormData,
    handleAddUser,
    errorMessage,
    setErrorMessage
  } = useApp();

  if (!showModal) return null;

  const fields = [
    { key: "userName", label: "Full Name", placeholder: "Enter full name" },
    { key: "userNumber", label: "Phone Number", placeholder: "Enter phone number" },
    { key: "course", label: "Course", placeholder: "Enter course" },
  ];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Lead</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowModal(false);
                setErrorMessage(""); // clear error when closing
              }}
            ></button>
          </div>

          <div className="modal-body">
            <div className="row g-3">
              {fields.map((field) => (
                <div key={field.key} className="col-12">
                  <label className="form-label">{field.label}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            {/* ✅ Error message display */}
            {errorMessage && (
              <div className="alert alert-danger mt-3 py-2">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                setErrorMessage("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddUser}
            >
              <i className="fas fa-plus me-2"></i>
              Add Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;