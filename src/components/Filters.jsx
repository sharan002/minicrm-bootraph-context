import React from 'react';
import { useApp } from '../context/AppContext';

const Filters = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortBy,
    setSortBy
  } = useApp();

  return (
    <div className="bg-white border-bottom p-3">
      <div className="container-fluid">
        <div className="row g-3 align-items-center">
          <div className="col-auto">
            <div className="d-flex align-items-center">
              <label className="form-label mb-0 me-2 fw-medium text-muted">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control form-control-sm"
                style={{width: '150px'}}
              />
            </div>
          </div>
          
          <div className="col-auto">
            <div className="d-flex align-items-center">
              <label className="form-label mb-0 me-2 fw-medium text-muted">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control form-control-sm"
                style={{width: '150px'}}
              />
            </div>
          </div>
          
          <div className="col-auto">
            <div className="d-flex align-items-center">
              <label className="form-label mb-0 me-2 fw-medium text-muted">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select form-select-sm"
                style={{width: '150px'}}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          
          {(startDate || endDate) && (
            <div className="col-auto">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="btn btn-sm btn-outline-danger"
              >
                <i className="fas fa-times me-1"></i>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;