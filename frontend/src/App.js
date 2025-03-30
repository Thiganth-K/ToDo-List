import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [priority, setPriority] = useState("medium");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [showDashboard, setShowDashboard] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null); // State for the ID of the task being edited
    const [editTaskText, setEditTaskText] = useState(""); // State for the edited task text
    const [editTaskPriority, setEditTaskPriority] = useState("medium"); // State for the edited task priority

    // Load tasks from backend
    useEffect(() => {
        axios.get("http://localhost:5000/tasks")
            .then((response) => {
                const sortedTasks = sortTasksByPriority(response.data);
                setTasks(sortedTasks);
                setFilteredTasks(sortedTasks);
            })
            .catch((error) => {
                console.error("Error fetching tasks:", error);
                alert("Failed to load tasks. Check the console for details.");
            });
    }, []);

    // Sort tasks by priority
    const sortTasksByPriority = (tasksList) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...tasksList].sort((a, b) => {
            const priorityA = a.priority ? priorityOrder[a.priority] : 4;
            const priorityB = b.priority ? priorityOrder[b.priority] : 4;
            return priorityA - priorityB;
        });
    };

    // Filter tasks based on search term
    useEffect(() => {
        const results = tasks.filter((task) =>
            task.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTasks(sortTasksByPriority(results));
    }, [searchTerm, tasks]);

    // Add a new task
    const addTask = () => {
        if (!task.trim()) return;

        axios.post("http://localhost:5000/tasks", { text: task, priority: priority })
            .then((response) => {
                const newTask = response.data.task;  // Backend returns the new task with ID
                const updatedTasks = [...tasks, newTask];
                const sortedTasks = sortTasksByPriority(updatedTasks);
                setTasks(sortedTasks);
                setFilteredTasks(sortedTasks); // Update filtered tasks too
                setTask("");
            })
            .catch((error) => {
                console.error("Error adding task:", error);
                alert("Failed to add task. Check the console for details.");
            });
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

    // Function to start editing a task
    const handleEditTask = (task) => {
        setEditingTaskId(task.id);
        setEditTaskText(task.text);
        setEditTaskPriority(task.priority);
    };

    // Function to save the edited task
    const handleSaveTask = () => {
        axios.put(`http://localhost:5000/tasks/${editingTaskId}`, {
            text: editTaskText,
            priority: editTaskPriority,
        })
            .then(() => {
                const updatedTasks = tasks.map((task) =>
                    task.id === editingTaskId ? { ...task, text: editTaskText, priority: editTaskPriority } : task
                );
                const sortedTasks = sortTasksByPriority(updatedTasks);
                setTasks(sortedTasks);
                setFilteredTasks(sortTasksByPriority(updatedTasks)); // Update filtered tasks too
                setEditingTaskId(null); // Exit editing mode
            })
            .catch((error) => {
                console.error("Error updating task:", error);
                alert("Failed to update task. Check the console for details.");
            });
    };

    // Function to cancel editing
    const handleCancelEdit = () => {
        setEditingTaskId(null); // Exit editing mode
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light-blue">
            {!showDashboard ? (
                <div className="text-center">
                    <h2 className="text-primary mb-4">Welcome to ToDo App</h2>
                    <button className="btn btn-primary btn-lg" onClick={toggleDashboard}>
                        Open ToDo Dashboard
                    </button>
                </div>
            ) : (
                <div className="card shadow-lg p-4 w-50">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-primary m-0">To-Do Dashboard</h2>
                        <button className="btn btn-outline-secondary btn-sm" onClick={toggleDashboard}>
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
                        <button className="btn btn-outline-primary">
                            Search
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
                    </div>

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
                                className={`list-group-item ${getPriorityColorClass(t.priority)}`}
                            >
                                {editingTaskId === t.id ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            value={editTaskText}
                                            onChange={(e) => setEditTaskText(e.target.value)}
                                            className="form-control me-2"
                                        />
                                        <select
                                            className="form-select me-2"
                                            value={editTaskPriority}
                                            onChange={(e) => setEditTaskPriority(e.target.value)}
                                        >
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                        <button className="btn btn-success btn-sm me-1" onClick={handleSaveTask}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{t.text}</span>
                                        <div>
                                            {t.priority && (
                                                <span
                                                    className={`badge ${t.priority === "high" ? "bg-danger" : t.priority === "medium" ? "bg-warning" : "bg-success"
                                                        }`}
                                                >
                                                    {t.priority}
                                                </span>
                                            )}
                                            <button
                                                className="btn btn-primary btn-sm ms-2"
                                                onClick={() => handleEditTask(t)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {filteredTasks.length === 0 && (
                        <p className="text-center text-muted mt-3">No tasks found</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
