import React from 'react';
import { useApp } from '../context/AppContext';

const DeleteConfirmModal = () => {
  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteLead
  } = useApp();

  if (!showDeleteConfirm) return null;

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body text-center p-4">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-warning fs-1"></i>
            </div>
            <h5 className="modal-title mb-3">Delete Lead</h5>
            <p className="text-muted mb-4">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteLead}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;