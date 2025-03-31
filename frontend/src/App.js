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
    const [editTaskId, setEditTaskId] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/tasks")
            
            .then((response) => {
                    const sortedTasks = sortTasksByPriority(response.data);
                    setTasks(sortedTasks);
                    setFilteredTasks(sortedTasks);
            })
                .catch((error) => console.error("Error fetching tasks:", error))
            .catch((error) => console.error("Error fetching tasks:", error));
    }, []);

    const sortTasksByPriority = (tasksList) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...tasksList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    };

    useEffect(() => {
        const results = tasks.filter((task) =>
            task.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTasks(sortTasksByPriority(results));
    }, [searchTerm, tasks]);

    const addTask = () => {
        if (!task.trim()) return;
        const newTask = { id: Date.now(), text: task, priority: priority };

        axios.post("http://localhost:5000/tasks", newTask)
            .then(() => {
                const updatedTasks = [...tasks, newTask];
                setTasks(sortTasksByPriority(updatedTasks));
                setTask("");
            })
            .catch((error) => console.error("Error adding task:", error));
    };

    const deleteTask = (id) => {
        if (!id || typeof id !== "number") {
            console.error("Invalid task ID:", id);
            return;
        }
    
        axios.delete(`http://localhost:5000/tasks/${id}`)
            .then(() => {
                setTasks(tasks.filter(task => task.id !== id));
                setFilteredTasks(tasks.filter(task => task.id !== id));
            })
            .catch((error) => console.error("Error deleting task:", error));
    };
    
    

    const startEditing = (id, text) => {
        setEditTaskId(id);
        setEditText(text);
    };

    const cancelEditing = () => {
        setEditTaskId(null);
        setEditText("");
    };

    const saveEditedTask = (id) => {
        if (!id || typeof id !== "number") {
            console.error("Invalid task ID:", id);
            return;
        }
    
        const updatedTask = {
            id,
            text: editText,
            priority: tasks.find(t => t.id === id)?.priority || "medium"
        };
    
        axios.put(`http://localhost:5000/tasks/${id}`, updatedTask)
            .then(() => {
                setTasks(tasks.map(task => task.id === id ? { ...task, text: editText } : task));
                setEditTaskId(null);
                setEditText("");
            })
            .catch(error => console.error("Error updating task:", error));
    };
    

    const clearSearch = () => {
        setSearchTerm("");
        setFilteredTasks(tasks);
    };
    const getPriorityColorClass = (priority) => {
        return priority === "high" ? "priority-high"
            : priority === "medium" ? "priority-medium"
            : "priority-low";
    };

    const toggleDashboard = () => {
        setShowDashboard(!showDashboard);
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

                    <div className="input-group mb-3">
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control" placeholder="Search tasks..." />
                        <button className="btn btn-outline-danger" onClick={clearSearch}>Clear</button>
                        <button 
                            className="btn btn-outline-danger"
                            onClick={clearSearch}
                        >
                            Clear
                        </button>
                    </div>

                    <div className="input-group mb-2">
                        <input type="text" value={task} onChange={(e) => setTask(e.target.value)}
                            className="form-control" placeholder="Enter task..." />
                        <button onClick={addTask} className="btn btn-primary">Add</button>
                    </div>

                    <div className="mb-3">
                        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                    </div>

                    <ul className="list-group">
                        {filteredTasks.map((t) => (
                            <li key={t.id} className={`list-group-item d-flex justify-content-between align-items-center ${getPriorityColorClass(t.priority)}`}>
                                {editTaskId === t.id ? (
                                    <>
                                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                                            className="form-control me-2" />
                                        <button className="btn btn-success btn-sm me-2" onClick={() => saveEditedTask(t.id)}>Save</button>
                                        <button className="btn btn-secondary btn-sm" onClick={cancelEditing}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <span>{t.text}</span>
                                        <div>
                                            <span className={`badge me-2 ${t.priority === "high" ? "bg-danger" : t.priority === "medium" ? "bg-warning" : "bg-success"}`}>
                                                {t.priority}
                                            </span>
                                            <button className="btn btn-warning btn-sm me-2" onClick={() => startEditing(t.id, t.text)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteTask(t.id)}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {filteredTasks.length === 0 && <p className="text-center text-muted mt-3">No tasks found</p>}
                </div>
            )}
        </div>
    );
}

export default App;
