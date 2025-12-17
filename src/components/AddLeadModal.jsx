import React from "react";
import { useApp } from "../context/AppContext";

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

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
            {errorMessage && (
              <div className="alert alert-danger mt-3 py-2">
                <p>Please check the details</p>
                 - {errorMessage}
              </div>
            )}

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">Add New Lead</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowModal(false);
                setErrorMessage("");
              }}
            />
          </div>

          {/* BODY */}
          <div className="modal-body">
            <div className="row g-3">

              {/* Name */}
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  value={formData.userName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                />
              </div>

              {/* Phone */}
              <div className="col-12">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-control"
                  value={formData.userNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, userNumber: e.target.value })
                  }
                />
              </div>

              {/* Location */}
              <div className="col-12">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              {/* Course */}
              <div className="col-12">
                <label className="form-label">Course</label>
                <select
                  className="form-select"
                  value={formData.course || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                >
                  <option value="">Select Course</option>
                  <option>Python Fullstack with AI</option>
                  <option>Java Fullstack with AI</option>
                  <option>MERN Stack with AI</option>
                  <option>Data Science</option>
                  <option>Data Analytics</option>
                  <option>Digital Marketing</option>
                </select>
              </div>

              {/* Program Type */}
              <div className="col-12">
                <label className="form-label">Program Type</label>
                <select
                  className="form-select"
                  value={formData.programType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, programType: e.target.value })
                  }
                >
                  <option value="">Select Type</option>
                  <option>8 hours</option>
                  <option>2 hours</option>
                </select>
              </div>

              {/* Profession */}
              <div className="col-12">
                <label className="form-label">Profession</label>
                <select
                  className="form-select"
                  value={formData.profession || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                >
                  <option value="">Select Profession</option>
                  <option>Job seeker</option>
                  <option>Student</option>
                  <option>Working profession</option>
                </select>
              </div>

              {/* Source */}
              <div className="col-12">
                <label className="form-label">Source</label>
                <select
                  className="form-select"
                  value={formData.leadfrom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, leadfrom: e.target.value })
                  }
                >
                  <option value="">Select Source</option>
                  <option>Whatsapp</option>
                  <option>Metaads</option>
                  <option>Website</option>
                  <option>Manual</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-12">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  <option>Hot</option>
                  <option>Warm</option>
                  <option>Cold</option>
                </select>
              </div>

              {/* Pipeline */}
              <div className="col-12">
                <label className="form-label">Pipeline</label>
                <select
                  className="form-select"
                  value={formData.pipeline || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pipeline: e.target.value })
                  }
                >
                  <option value="">Select Pipeline</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Asked Time</option>
                  <option>Not intrested</option>
                </select>
              </div>

            </div>

            {/* ERROR MESSAGE */}
            {/* {errorMessage && (
              <div className="alert alert-danger mt-3 py-2">
                <p>Please check all the details of the form</p>
                 - {errorMessage}
              </div>
            )} */}
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                setErrorMessage("");
              }}
            >
              Cancel
            </button>

            <button
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
