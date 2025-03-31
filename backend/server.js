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
//task delete pannum paguthi
app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);

    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });

        let tasks = JSON.parse(data);
        const updatedTasks = tasks.filter(task => task.id !== taskId);

        // Check if the task exists
        if (tasks.length === updatedTasks.length) {
            return res.status(404).json({ error: "Task not found" });
        }

        fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error writing file" });
            res.json({ message: "Task deleted successfully" });
        });
    });
});

app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);

    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });

        let tasks = JSON.parse(data);
        const index = tasks.findIndex(task => task.id === taskId);

        if (index === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        tasks.splice(index, 1);

        fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error writing file" });

            res.status(200).json({ message: "Task deleted" });
        });
    });
});


app.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const { text, priority } = req.body;

    fs.readFile(TASKS_FILE, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });

        let tasks = JSON.parse(data);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Update task
        tasks[taskIndex] = { ...tasks[taskIndex], text, priority: priority || tasks[taskIndex].priority };

        // Save the updated tasks
        fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error writing file" });

            res.json(tasks[taskIndex]);
        });
    });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
