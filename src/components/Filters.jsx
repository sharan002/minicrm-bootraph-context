import React, { useMemo } from 'react';
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
    assigneeList
  } = useApp();

  // Constants from user request (Updated to match backend data)
  const courses = [
    "Full Stack Python with AI", "Full Stack Java with AI",
    "Full Stack Developer MERN with AI", "Data Science",
    "Data Analytics", "Digital Marketing"
  ];

  const leadSources = ["Whatsapp", "metaads", "Website", "manual"];
  const pipelines = ["New", "Contacted", "Won", "Not Interested"];
  const statuses = ["New", "Hot", "Warm", "Cold"];
  const programTypes = ["8 hours", "2 hours"];
  const professions = ["Job seeker", "Student", "Working"];

  // Get selected filters as an array of objects
  const selectedFilters = useMemo(() => {
    const filters = [];
    
    if (courseFilter) filters.push({ 
      key: 'courseFilter', 
      label: 'Course', 
      value: courseFilter,
      remove: () => setCourseFilter("")
    });
    
    if (leadSourceFilter) filters.push({ 
      key: 'leadSourceFilter', 
      label: 'Lead From', 
      value: leadSourceFilter,
      remove: () => setLeadSourceFilter("")
    });
    
    if (pipelineFilter) filters.push({ 
      key: 'pipelineFilter', 
      label: 'Pipeline', 
      value: pipelineFilter,
      remove: () => setPipelineFilter("")
    });
    
    if (statusFilter) filters.push({ 
      key: 'statusFilter', 
      label: 'Status', 
      value: statusFilter,
      remove: () => setStatusFilter("")
    });
    
    if (programTypeFilter) filters.push({ 
      key: 'programTypeFilter', 
      label: 'Program Type', 
      value: programTypeFilter,
      remove: () => setProgramTypeFilter("")
    });
    
    if (professionFilter) filters.push({ 
      key: 'professionFilter', 
      label: 'Profession', 
      value: professionFilter,
      remove: () => setProfessionFilter("")
    });
    
    if (assignedToFilter) {
      const assignee = assigneeList?.find(a => a.userNumber === assignedToFilter);
      const displayValue = assignee ? assignee.useremail || assignee.userName : assignedToFilter;
      filters.push({ 
        key: 'assignedToFilter', 
        label: 'Assigned To', 
        value: displayValue,
        remove: () => setAssignedToFilter("")
      });
    }
    
    if (dateCreatedFilter) filters.push({ 
      key: 'dateCreatedFilter', 
      label: 'Date Created', 
      value: new Date(dateCreatedFilter).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      remove: () => setDateCreatedFilter("")
    });
    
    return filters;
  }, [
    courseFilter, leadSourceFilter, pipelineFilter, statusFilter,
    programTypeFilter, professionFilter, assignedToFilter, dateCreatedFilter,
    assigneeList
  ]);

  const hasActiveFilters = selectedFilters.length > 0;
  const activeFiltersCount = selectedFilters.length;

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

  return (
    <div className="bg-white border-bottom">
      {/* Selected Filters Display */}
      {hasActiveFilters && (
        <div className="border-bottom py-2 px-3 bg-light">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="small text-muted me-2">
                  <i className="fas fa-filter me-1"></i>
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active:
                </span>
              </div>
              <div className="col">
                <div className="d-flex flex-wrap gap-1">
                  {selectedFilters.map(filter => (
                    <div 
                      key={filter.key} 
                      className="badge bg-white text-dark border d-flex align-items-center gap-1 px-2 py-1"
                      style={{ 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'normal'
                      }}
                    >
                      <span className="text-muted">{filter.label}:</span>
                      <span className="fw-medium">{filter.value}</span>
                      <button
                        onClick={filter.remove}
                        className="btn btn-sm p-0 ms-1"
                        style={{ 
                          width: '14px', 
                          height: '14px',
                          fontSize: '8px',
                          lineHeight: '1'
                        }}
                        title={`Remove ${filter.label} filter`}
                      >
                        <i className="fas fa-times text-muted"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-auto">
                <button
                  onClick={clearFilters}
                  className="btn btn-sm btn-outline-danger"
                  style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Filter Controls - EXACT SAME SIZING AS ORIGINAL */}
      <div className="p-3">
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
                {assigneeList && assigneeList.length > 0 ? (
                  assigneeList.map(staff => (
                    <option key={staff.userNumber || staff._id} value={staff.userNumber}>
                      {staff.useremail || staff.userName}
                    </option>
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

      {/* Optional: Add CSS for hover effects */}
      <style jsx>{`
        .badge.bg-white:hover {
          background-color: #f8f9fa !important;
          cursor: default;
        }
        .badge.bg-white button:hover {
          background-color: #e9ecef;
          border-radius: 50%;
        }
        .form-select-sm:focus, .form-control-sm:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Filters;