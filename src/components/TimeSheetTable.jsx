import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";
import "../styles/TimesheetTable.css";
import { useNavigate } from "react-router-dom";
import { timesheetAPI } from "../services/api";

const TimeSheetTable = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch timesheets on component mount
  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        setLoading(true);
        const response = await timesheetAPI.getTimesheets();
        setTimesheets(response.data || []);
      } catch (err) {
        console.error('Error fetching timesheets:', err);
        setError('Failed to load timesheets. Please check if backend server is running.');
        setTimesheets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, []);

  // Helper function to format date range
  const formatDateRange = (weekStarting, weekEnding) => {
    const start = new Date(weekStarting);
    const end = new Date(weekEnding);
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en-US', { month: 'long' })}, ${start.getFullYear()}`;
  };

  const [dateRange, setDateRange] = useState("all");
  const [status, setStatus] = useState("all");

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Calculate status based on totalHours
  const getStatusFromHours = (totalHours) => {
    if (totalHours === 40) {
      return "completed";
    } else if (totalHours > 0 && totalHours < 40) {
      return "incomplete";
    } else {
      return "missing";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "incomplete":
        return "#f59e0b";
      case "missing":
        return "#b9102f";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "COMPLETED";
      case "incomplete":
        return "INCOMPLETE";
      case "missing":
        return "MISSING";
      default:
        return status.toUpperCase();
    }
  };

  const getActionText = (status) => {
    switch (status) {
      case "completed":
        return "View";
      case "incomplete":
        return "Update";
      case "missing":
        return "Create";
      default:
        return "View";
    }
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get unique date ranges from timesheets
  const getDateRangeOptions = () => {
    const ranges = new Set();
    timesheets.forEach(timesheet => {
      const range = formatDateRange(timesheet.weekStarting, timesheet.weekEnding);
      ranges.add(range);
    });
    return Array.from(ranges).sort();
  };

  // Filter timesheets based on date range and status
  const filteredTimesheets = timesheets.filter((timesheet) => {
    // Status filter - calculate status from totalHours
    const calculatedStatus = getStatusFromHours(timesheet.totalHours);
    if (status !== "all" && calculatedStatus !== status) {
      return false;
    }

    // Date range filter - check if selected range matches the formatted date range
    if (dateRange !== "all") {
      const timesheetRange = formatDateRange(timesheet.weekStarting, timesheet.weekEnding);
      return timesheetRange === dateRange;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTimesheets = filteredTimesheets.slice(startIndex, endIndex);

  const handleOpenModal = (timesheet) => {
    navigate(`/timesheet/${timesheet.id}`, { state: { timesheet } });
  };
  
  if (loading) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: 40 }}>
            Loading timesheets...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-main">
      <div className="dashboard-content">
        <div className="dashboard-stats"></div>

        <div className="timesheets-section">
          <div className="section-header">
            <h1 className="section-title">Your Timesheets</h1>

            <div className="filters">
              <div className="filter-group">
                <label>Date Range</label>
                <select
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  {getDateRangeOptions().map((range, index) => (
                    <option key={index} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="table-container">
            <table className="timesheets-table">
              <thead>
                <tr>
                  <th>WEEK #</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No timesheets found.
                    </td>
                  </tr>
                ) : (
                  currentTimesheets.map((timesheet, index) => (
                    <tr key={timesheet.id}>
                      <td className="week-number">{startIndex + index + 1}</td>
                      <td className="date-range">{formatDateRange(timesheet.weekStarting, timesheet.weekEnding)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(getStatusFromHours(timesheet.totalHours)),
                          }}
                        >
                          {getStatusText(getStatusFromHours(timesheet.totalHours))}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn"
                          onClick={() => handleOpenModal(timesheet)}
                        >
                          {getActionText(getStatusFromHours(timesheet.totalHours))}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </main>
  );
};

export default TimeSheetTable;
