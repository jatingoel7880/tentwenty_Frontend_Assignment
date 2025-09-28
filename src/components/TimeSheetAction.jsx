import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MdMoreVert, MdEdit, MdDelete } from "react-icons/md";
import "../styles/TimesheetTable.css";
import { timesheetAPI } from "../services/api";

// Helper functions to get current week dates
const getWeekStartDate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  return weekStart.toISOString().split('T')[0];
};

const getWeekEndDate = () => {
  const weekStart = new Date(getWeekStartDate());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd.toISOString().split('T')[0];
};

const TimeSheetAction = () => {
  const location = useLocation();
  const { userId, timesheetId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    userId: userId || null,
    weekStarting: '',
    weekEnding: '',
    totalHours: 0,
    status: 'draft',
    entries: []
  });

  const [showDropdown, setShowDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [modalData, setModalData] = useState({
    project: '',
    typeOfWork: 'Bug fixes',
    description: '',
    hours: 8
  });

  // Fetch timesheet data on component mount
  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        setLoading(true);
        let timesheetData;
        
        if (timesheetId) {
          // Fetch specific timesheet by ID
          const response = await timesheetAPI.getTimesheetById(timesheetId);
          timesheetData = response.data;
        } else if (userId) {
          // Fetch user's timesheets and get the latest one or create new
          const response = await timesheetAPI.getTimesheets(userId);
          const userTimesheets = response.data;
          
          if (userTimesheets && userTimesheets.length > 0) {
            // Get the latest timesheet or create new one
            timesheetData = userTimesheets[0];
          } else {
            // Create new timesheet structure for new user
            timesheetData = {
              userId: parseInt(userId),
              weekStarting: getWeekStartDate(),
              weekEnding: getWeekEndDate(),
              totalHours: 0,
              status: 'draft',
              entries: []
            };
          }
        } else {
          // Get current user's data from location state or create new
          timesheetData = location.state?.timesheet || {
            weekStarting: getWeekStartDate(),
            weekEnding: getWeekEndDate(),
            totalHours: 0,
            status: 'draft',
            entries: []
          };
        }
        
        setFormData(timesheetData);
      } catch (err) {
        console.error('Error fetching timesheet data:', err);
        setError('Failed to load timesheet data');
        // Set default data on error
        setFormData({
          userId: userId || null,
          weekStarting: getWeekStartDate(),
          weekEnding: getWeekEndDate(),
          totalHours: 0,
          status: 'draft',
          entries: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheetData();
  }, [timesheetId, userId, location.state]);


  const handleAddTask = (dateId) => {
    setSelectedDate(dateId);
    setEditingTask(null);
    setModalData({
      project: '',
      typeOfWork: 'Bug fixes',
      description: '',
      hours: 8
    });
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedDate(task.date);
    setModalData({
      project: task.project || '',
      typeOfWork: task.typeOfWork || '',
      description: task.description || '',
      hours: task.hours || 8
    });
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleModalSubmit = async () => {
    if (!modalData.project || !modalData.description) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedEntries;
    
    if (editingTask) {
      // Update existing task
      updatedEntries = formData.entries.map(entry => 
        entry.id === editingTask.id 
          ? {
              ...entry,
              description: modalData.description,
              hours: modalData.hours,
              project: modalData.project,
              typeOfWork: modalData.typeOfWork
            }
          : entry
      );
    } else {
      // Add new task
      const newTask = {
        id: Date.now(),
        date: selectedDate,
        description: modalData.description,
        hours: modalData.hours,
        project: modalData.project,
        typeOfWork: modalData.typeOfWork
      };
      updatedEntries = [...(formData.entries || []), newTask];
    }
    
    const updatedTotalHours = updatedEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    setFormData(prev => ({
      ...prev,
      entries: updatedEntries,
      totalHours: updatedTotalHours
    }));

    // Save to backend if timesheet exists
    if (formData.id) {
      try {
        await timesheetAPI.updateTimesheet(formData.id, {
          ...formData,
          entries: updatedEntries,
          totalHours: updatedTotalHours
        });
      } catch (err) {
        console.error('Error updating timesheet:', err);
        setError('Failed to save timesheet');
      }
    }

    setShowModal(false);
    setSelectedDate('');
    setEditingTask(null);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setSelectedDate('');
    setEditingTask(null);
    setModalData({
      project: '',
      typeOfWork: '',
      description: '',
      hours: 8
    });
  };

  const handleDeleteTask = async (dateId, taskId) => {
    if (!Array.isArray(formData.entries)) return;
    
    const task = formData.entries.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedEntries = formData.entries.filter(t => t.id !== taskId);
    const updatedTotalHours = updatedEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    setFormData(prev => ({
      ...prev,
      entries: updatedEntries,
      totalHours: updatedTotalHours
    }));
    setShowDropdown(null);

    // Save to backend if timesheet exists
    if (formData.id) {
      try {
        await timesheetAPI.updateTimesheet(formData.id, {
          ...formData,
          entries: updatedEntries,
          totalHours: updatedTotalHours
        });
      } catch (err) {
        console.error('Error updating timesheet:', err);
        setError('Failed to save timesheet');
      }
    }
  };

  const toggleDropdown = (taskId) => {
    setShowDropdown(showDropdown === taskId ? null : taskId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = () => {
    if (formData.weekStarting && formData.weekEnding) {
      const start = new Date(formData.weekStarting);
      const end = new Date(formData.weekEnding);
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en-US', { month: 'long' })}, ${start.getFullYear()}`;
    }
    return 'This week';
  };

  // const getWeekNumber = () => {
  //   if (formData.weekStarting) {
  //     const date = new Date(formData.weekStarting);
  //     const firstDay = new Date(date.getFullYear(), 0, 1);
  //     const pastDaysOfYear = (date - firstDay) / 86400000;
  //     return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  //   }
  //   return 1;
  // };

  // Group entries by date for display
  const groupEntriesByDate = () => {
    if (!formData.entries || !Array.isArray(formData.entries)) return [];
    
    const grouped = {};
    formData.entries.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });
    
    return Object.keys(grouped).sort().map(date => ({
      id: date,
      date: date,
      tasks: grouped[date]
    }));
  };

  if (loading) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: 40 }}>
            Loading timesheet data...
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
        <div className="timesheets-section">
          <div className="section-header">
              {/* <button onClick={handleBack} className="back-btn">
                <MdArrowBack /> Back to Timesheets
              </button> */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <h1 className="section-title" style={{ margin: 0, textAlign: 'left' }}>This week timesheet</h1>
                  <div style={{ fontSize: 16, color: "#6b7280", marginTop: 4 }}>
                    {formatDateRange()}
                  </div>
                </div>
                <div style={{ width: 260, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ position: "relative", width: "100%", marginBottom: 8 }}>
                    {/* Bubble with pointer */}
                    <div style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: -25,
                      zIndex: 2,
                      background: "rgb(255 255 255)",
                      borderRadius: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      padding: "10px 24px",
                      fontWeight: 600,
                      fontSize: 20,
                      color: "#222",
                      textAlign: "center",
                      minWidth: 150,
                    }}>
                      {formData.totalHours || 0}/40 hrs
                      {/* Pointer */}
                      <div style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: -12,
                        width: 0,
                        height: 0,
                        borderLeft: "12px solid transparent",
                        borderRight: "12px solid transparent",
                        borderTop: "12px solid #fff",
                        zIndex: 3,
                      }} />
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      position: "relative",
                      height: 10,
                      background: "#e5e7eb",
                      borderRadius: 6,
                      width: "100%",
                      marginTop: 32,
                    }}>
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: 10,
                        borderRadius: 6,
                        background: "#ff944d",
                        width: `${Math.min(100, ((formData.totalHours || 0) / 40) * 100)}%`,
                        transition: "width 0.3s",
                      }}></div>
                    </div>
                    {/* Percentage */}
                    <span style={{
                      position: "absolute",
                      right: 0,
                      top: -8,
                      color: "#9ca3af",
                      fontWeight: 600,
                      fontSize: 18,
                      zIndex: 2,
                    }}>
                      {`${Math.round(((formData.totalHours || 0) / 40) * 100)}%`}
                    </span>
                  </div>
                </div>
            </div>
          </div>

          <div className="action-content">
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {groupEntriesByDate().map((entry) => (
                <div key={entry.id} style={{ marginBottom: 32 }}>
                  {/* Date Header */}
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 16,
                    margin: 0
                  }}>
                    {formatDate(entry.date)}
                  </h3>

                  {/* Task Entries */}
                  {Array.isArray(entry.tasks) && entry.tasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleEditTask(task)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f3f4f6',
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: 8,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: 16,
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          {task.description}
                        </span>
              </div>

                      <div style={{ marginRight: 12 }}>
                        <span style={{
                          fontSize: 16,
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          {task.hours} hrs
                        </span>
              </div>

                      <div style={{ marginRight: 12 }}>
                        <button style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          borderRadius: 16,
                          padding: '4px 12px',
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}>
                          {task.project}
                        </button>
              </div>

                      {/* More Options Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(task.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <MdMoreVert size={20} color="#6b7280" />
                        </button>
                        
                        {showDropdown === task.id && (
                          <div style={{
                            position: 'absolute',
                            top: 32,
                            right: 0,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            minWidth: 120
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                fontSize: 14,
                                color: '#374151',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              <MdEdit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.date, task.id);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                fontSize: 14,
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              <MdDelete size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add New Task Button */}
                  <button
                    onClick={() => handleAddTask(entry.date)}
                    style={{
                      width: '100%',
                      marginTop: 12,
                      padding: '12px 24px',
                      border: '2px dashed #d1d5db',
                      background: '#f9fafb',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.color = '#3b82f6';
                      e.target.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.color = '#6b7280';
                      e.target.style.background = '#f9fafb';
                    }}
                  >
                    + Add new task
                  </button>
                 </div>
               ))}
               
               {groupEntriesByDate().length === 0 && (
                 <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                   No timesheet entries found. Click "Add new task" to get started.
                 </div>
                  )}
                </div>
          </div>
        </div>
      </div>
      
      {/* Add New Entry Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111827',
                margin: 0
              }}>
                {editingTask ? 'Edit Entry' : 'Add New Entry'}
              </h2>
              <button
                onClick={handleModalCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 4
                }}
              >
                ×
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Select Project */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Select Project *
                  <span style={{ color: '#6b7280', fontSize: 12 }}>i</span>
                </label>
                <select
                  value={modalData.project}
                  onChange={(e) => setModalData(prev => ({ ...prev, project: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Project Name</option>
                  <option value="TenTwenty App">TenTwenty App</option>
                  <option value="Project Name">Project Name</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                </select>
              </div>

              {/* Type of Work */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Type of Work *
                  <span style={{ color: '#6b7280', fontSize: 12 }}>i</span>
                </label>
                <select
                  value={modalData.typeOfWork}
                  onChange={(e) => setModalData(prev => ({ ...prev, typeOfWork: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: 'white'
                  }}
                >
                  <option value="Bug fixes">Bug fixes</option>
                  <option value="Feature Development">Feature Development</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Testing">Testing</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>

              {/* Task Description */}
              <div>
                <label style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 8,
                  display: 'block'
                }}>
                  Task description *
                </label>
                <textarea
                  value={modalData.description}
                  onChange={(e) => setModalData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write text here..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    minHeight: 100,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{
                  fontSize: 12,
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  A note for extra info
                </p>
              </div>

              {/* Hours */}
              <div>
                <label style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 8,
                  display: 'block'
                }}>
                  Hours *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  width: 'fit-content'
                }}>
                  <button
                    type="button"
                    onClick={() => setModalData(prev => ({ 
                      ...prev, 
                      hours: Math.max(0, prev.hours - 1) 
                    }))}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#6b7280'
                    }}
                  >
                    -
                </button>
                  <span style={{
                    padding: '12px 20px',
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#111827',
                    minWidth: 60,
                    textAlign: 'center'
                  }}>
                    {modalData.hours}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalData(prev => ({ 
                      ...prev, 
                      hours: Math.min(24, prev.hours + 1) 
                    }))}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#6b7280'
                    }}
                  >
                    +
                </button>
              </div>
            </div>
          </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 32,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleModalCancel}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {editingTask ? 'Update entry' : 'Add entry'}
              </button>
            </div>
        </div>
      </div>
      )}
    </main>
  );
};

export default TimeSheetAction;
