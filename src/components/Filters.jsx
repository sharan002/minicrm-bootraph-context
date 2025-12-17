import React from 'react';
import { useApp } from '../context/AppContext';

const Filters = () => {
  const {
    courseFilter, setCourseFilter,
    leadSourceFilter, setLeadSourceFilter,
    pipelineFilter, setPipelineFilter,
    statusFilter, setStatusFilter,
    programTypeFilter, setProgramTypeFilter,
    professionFilter, setProfessionFilter,
    assignedToFilter, setAssignedToFilter,
    dateCreatedFilter, setDateCreatedFilter,
    users
  } = useApp();

  // Constants from user request (Updated to match backend data)
  const courses = [
    "Full Stack Python with AI", "Full Stack Java with AI",
    "Full Stack Developer MERN with AI", "Data Science",
    "Data Analytics", "Digital Marketing"
  ];

  const leadSources = ["Whatsapp", "metaads", "Website", "manual"]; // mapped to leadSource
  const pipelines = ["New", "Contacted", "Won", "Not Interested"]; // Updated casing based on "New"
  const statuses = ["New", "Hot", "Warm", "Cold"]; // Updated to include "New" and casing
  const programTypes = ["8 hours", "2 hours"]; // Updated format "8 hours"
  const professions = ["Job seeker", "Student", "Working"]; // Updated casing "Job seeker"

  // Dynamic list derived from existing users to find potential assignees (staff) could be better, 
  // but sticking to user snippet's hardcoded values OR dynamic if available. 
  // User snippet had hardcoded ["123", "456"]. 
  // I'll combine hardcoded + any unique assignees found in data just in case?
  // Actually, let's stick to the constants for now as per snippet, and maybe map distinct values found in data if 'assignedto' field exists.
  // In AppContext we have `assigneeList` which comes from Staffs. I should use that if available.
  const { assigneeList } = useApp();

  const clearFilters = () => {
    setCourseFilter("");
    setLeadSourceFilter("");
    setPipelineFilter("");
    setStatusFilter("");
    setProgramTypeFilter("");
    setProfessionFilter("");
    setAssignedToFilter("");
    setDateCreatedFilter("");
  };

  const hasActiveFilters = courseFilter || leadSourceFilter || pipelineFilter || statusFilter || programTypeFilter || professionFilter || assignedToFilter || dateCreatedFilter;

  return (
    <div className="bg-white border-bottom p-3">
      <div className="container-fluid">
        <div className="row g-2 align-items-center">

          {/* COURSE */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="">Course</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* LEAD FROM */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={leadSourceFilter}
              onChange={(e) => setLeadSourceFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="">Lead From</option>
              {leadSources.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* PIPELINE */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="">Pipeline</option>
              {pipelines.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* STATUS */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '120px' }}
            >
              <option value="">Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* PROGRAM TYPE */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={programTypeFilter}
              onChange={(e) => setProgramTypeFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">Program Type</option>
              {programTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </select>
          </div>

          {/* PROFESSION */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="">Profession</option>
              {professions.map(pr => <option key={pr} value={pr}>{pr}</option>)}
            </select>
          </div>

          {/* ASSIGNED TO */}
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="">Assigned To</option>
              {/* Prefer real staff list from context, fallback to snippet hardcoded if empty/needed */}
              {assigneeList && assigneeList.length > 0 ? (
                assigneeList.map(staff => (
                  <option key={staff.userNumber || staff._id} value={staff.userNumber}>{staff.useremail || staff.userName}</option>
                ))
              ) : (
                <>
                  <option value="123">123</option>
                  <option value="456">456</option>
                </>
              )}
            </select>
          </div>

          {/* DATE CREATED */}
          <div className="col-auto">
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateCreatedFilter}
              onChange={(e) => setDateCreatedFilter(e.target.value)}
            />
          </div>

          {/* CLEAR BUTTON */}
          {hasActiveFilters && (
            <div className="col-auto">
              <button
                onClick={clearFilters}
                className="btn btn-sm btn-outline-danger"
              >
                <i className="fas fa-times me-1"></i>
                Clear
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Filters;
