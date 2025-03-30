const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const TASKS_FILE = "tasks.json";

// task read agum idham
app.get("/tasks", (req, res) => {
    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });
        res.json(JSON.parse(data));
    });
});

// task add pannum idham
app.post("/tasks", (req, res) => {
    const newTask = req.body;
    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });

        const tasks = JSON.parse(data);
        tasks.push(newTask);

        fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error writing file" });
            res.json({ message: "Task added", task: newTask });
        });
    });
});

app.put("/tasks/:id", (req, res) => {
    const taskId = req.params.id;
    const { text, priority } = req.body;

    if (!text || !priority || !['high', 'medium', 'low'].includes(priority)) {
        return res.status(400).json({ error: "Invalid task data" });
    }

    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) {
            console.error("Error reading tasks file:", err);
            return res.status(500).json({ error: "Error reading file" });
        }

        let tasks = JSON.parse(data);
        const taskIndex = tasks.findIndex((task) => task.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Update the task
        tasks[taskIndex] = { ...tasks[taskIndex], text, priority };

        fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                console.error("Error writing tasks file:", err);
                return res.status(500).json({ error: "Error writing file" });
            }
            res.json({ message: "Task updated" });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
