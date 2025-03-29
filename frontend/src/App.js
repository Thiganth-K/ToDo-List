import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // blue theme call 
function App() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");

    //task ah backend la irundhu endhukum idham
    useEffect(() => {
        axios.get("http://localhost:5000/tasks").then((response) => {
            setTasks(response.data);
        });
    }, []);

    // new task inga add pannum edam
    const addTask = () => {
        if (!task.trim()) return;

        const newTask = { id: Date.now(), text: task };
        axios.post("http://localhost:5000/tasks", newTask).then(() => {
            setTasks([...tasks, newTask]);
            setTask("");
        });
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light-blue">
            <div className="card shadow-lg p-4 w-50">
                <h2 className="text-primary text-center mb-4">To-Do Dashboard</h2>
                <div className="input-group mb-3">
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
                <ul className="list-group">
                    {tasks.map((t) => (
                        <li key={t.id} className="list-group-item">
                            {t.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
