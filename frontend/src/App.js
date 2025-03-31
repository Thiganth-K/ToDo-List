import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium"); // Default priority
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // New states for task datepicker
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // New states for diary feature
  const [diaryText, setDiaryText] = useState("");
  const [diaryDate, setDiaryDate] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [showDiaryDatePicker, setShowDiaryDatePicker] = useState(false);

  // Load tasks from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/tasks")
      .then((response) => {
        const sortedTasks = sortTasksByPriority(response.data);
        setTasks(sortedTasks);
        setFilteredTasks(sortedTasks); // Initialize filtered tasks
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  // Load diary entries from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/diary")
      .then((response) => {
        setDiaryEntries(response.data);
      })
      .catch((error) => console.error("Error fetching diary entries:", error));
  }, []);

  // Sort tasks by priority (high > medium > low)
  const sortTasksByPriority = (tasksList) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...tasksList].sort((a, b) => {
      const priorityA = a.priority ? priorityOrder[a.priority] : 4; // Tasks without priority go last
      const priorityB = b.priority ? priorityOrder[b.priority] : 4;
      return priorityA - priorityB;
    });
  };

  // Filter tasks based on search term
  useEffect(() => {
    const results = tasks.filter((t) =>
      t.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTasks(sortTasksByPriority(results));
  }, [searchTerm, tasks]);

  // Add a new task
  const addTask = () => {
    if (!task.trim()) return;
    const newTask = {
      id: Date.now(),
      text: task,
      priority: priority,
      date: selectedDate, // include date if set
    };
    axios
      .post("http://localhost:5000/tasks", newTask)
      .then(() => {
        const updatedTasks = [...tasks, newTask];
        const sortedTasks = sortTasksByPriority(updatedTasks);
        setTasks(sortedTasks);
        setTask("");
        setSelectedDate(null); // reset date after adding task
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  // Delete a task
  const deleteTask = (id) => {
    axios
      .delete(`http://localhost:5000/tasks/${id}`)
      .then(() => {
        const updatedTasks = tasks.filter((t) => t.id !== id);
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  // Clear search field
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredTasks(tasks);
  };

  // Get priority color class
  const getPriorityColorClass = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  // Add a new diary entry
  const addDiaryEntry = () => {
    if (!diaryText.trim() || !diaryDate) return;
    const newEntry = {
      id: Date.now(),
      text: diaryText,
      date: diaryDate,
    };
    axios
      .post("http://localhost:5000/diary", newEntry)
      .then((response) => {
        setDiaryEntries([...diaryEntries, response.data.entry]);
        setDiaryText("");
        setDiaryDate(null);
      })
      .catch((error) => console.error("Error adding diary entry:", error));
  };

  // Delete a diary entry
  const deleteDiaryEntry = (id) => {
    axios
      .delete(`http://localhost:5000/diary/${id}`)
      .then(() => {
        const updatedEntries = diaryEntries.filter((entry) => entry.id !== id);
        setDiaryEntries(updatedEntries);
      })
      .catch((error) => console.error("Error deleting diary entry:", error));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light-blue">
      {!showDashboard ? (
        <div className="text-center">
          <h2 className="text-primary mb-4">Welcome to ToDo App</h2>
          <button className="btn btn-primary btn-lg" onClick={toggleDashboard}>
            Open To Do Dashboard
          </button>
        </div>
      ) : (
        <div className="card shadow-lg p-4 w-50">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary m-0">To-Do Dashboard</h2>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleDashboard}
            >
              Close
            </button>
          </div>

          {/* Search bar */}
          <div className="input-group mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              placeholder="Search tasks..."
            />
            <button className="btn btn-outline-primary">Search</button>
            <button className="btn btn-outline-danger" onClick={clearSearch}>
              Clear
            </button>
          </div>

          {/* Task input */}
          <div className="input-group mb-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="form-control"
              placeholder="Enter task..."
            />
            <button onClick={addTask} className="btn btn-primary">
              Add
            </button>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="btn btn-secondary ms-2"
            >
              +
            </button>
          </div>

          {/* Calendar datepicker for task date */}
          {showDatePicker && (
            <div className="mb-3">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setShowDatePicker(false);
                }}
                inline
              />
            </div>
          )}

          {/* Priority selector */}
          <div className="mb-3">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Task list */}
          <ul className="list-group">
            {filteredTasks.map((t) => (
              <li
                key={t.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${getPriorityColorClass(
                  t.priority
                )}`}
              >
                <span>
                  {t.text}{" "}
                  {t.date && (
                    <small className="text-muted ms-2">
                      ({new Date(t.date).toLocaleDateString()})
                    </small>
                  )}
                </span>
                <div>
                  {t.priority && (
                    <span
                      className={`badge me-2 ${
                        t.priority === "high"
                          ? "bg-danger"
                          : t.priority === "medium"
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                    >
                      {t.priority}
                    </span>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTask(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {filteredTasks.length === 0 && (
            <p className="text-center text-muted mt-3">No tasks found</p>
          )}

          {/* New Diary Section */}
          <div className="mt-4">
            <h4>Diary</h4>
            <div className="input-group mb-2">
              <input
                type="text"
                value={diaryText}
                onChange={(e) => setDiaryText(e.target.value)}
                className="form-control"
                placeholder="Write diary entry..."
              />
              <button onClick={addDiaryEntry} className="btn btn-primary">
                Add Diary
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={() => setShowDiaryDatePicker(!showDiaryDatePicker)}
              >
                Select Date
              </button>
            </div>
            {showDiaryDatePicker && (
              <div className="mb-3">
                <DatePicker
                  selected={diaryDate}
                  onChange={(date) => {
                    setDiaryDate(date);
                    setShowDiaryDatePicker(false);
                  }}
                  inline
                />
              </div>
            )}
            <ul className="list-group">
              {diaryEntries.map((entry) => (
                <li className="list-group-item" key={entry.id}>
                  {entry.text}{" "}
                  {entry.date && (
                    <small className="text-muted ms-2">
                      ({new Date(entry.date).toLocaleDateString()})
                    </small>
                  )}
                  <button
                    className="btn btn-sm btn-danger float-end"
                    onClick={() => deleteDiaryEntry(entry.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
