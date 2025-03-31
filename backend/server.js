const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const TASKS_FILE = "tasks.json";
const DIARY_FILE = "diary.json";

// Ensure tasks.json exists
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, "[]", "utf8");
}

// Ensure diary.json exists
if (!fs.existsSync(DIARY_FILE)) {
  fs.writeFileSync(DIARY_FILE, "[]", "utf8");
}

// Get all diary entries
app.get("/diary", (req, res) => {
  fs.readFile(DIARY_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading diary file" });
    try {
      const entries = JSON.parse(data);
      res.json(entries);
    } catch (e) {
      res.status(500).json({ error: "Error parsing diary data" });
    }
  });
});

// Add a new diary entry
app.post("/diary", (req, res) => {
  const newEntry = req.body;
  fs.readFile(DIARY_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading diary file" });
    let entries = [];
    try {
      entries = JSON.parse(data);
    } catch (e) {
      entries = [];
    }
    entries.push(newEntry);
    fs.writeFile(DIARY_FILE, JSON.stringify(entries, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error writing diary file" });
      res.json({ message: "Diary entry added", entry: newEntry });
    });
  });
});

// Get all tasks
app.get("/tasks", (req, res) => {
  fs.readFile(TASKS_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading file" });
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "Error parsing tasks data" });
    }
  });
});
// ...existing code above...
// Add a new diary entry
app.post("/diary", (req, res) => {
  const newEntry = req.body;
  fs.readFile(DIARY_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading diary file" });
    let entries = [];
    try {
      entries = JSON.parse(data);
    } catch (e) {
      entries = [];
    }
    entries.push(newEntry);
    fs.writeFile(DIARY_FILE, JSON.stringify(entries, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error writing diary file" });
      res.json({ message: "Diary entry added", entry: newEntry });
    });
  });
});

// Delete a diary entry
app.delete("/diary/:id", (req, res) => {
  const diaryId = parseInt(req.params.id);
  fs.readFile(DIARY_FILE, (err, data) => {
    if (err) 
      return res.status(500).json({ error: "Error reading diary file" });
    let entries = [];
    try {
      entries = JSON.parse(data);
    } catch (e) {
      entries = [];
    }
    const updatedEntries = entries.filter((entry) => entry.id !== diaryId);
    if (entries.length === updatedEntries.length) {
      return res.status(404).json({ error: "Diary entry not found" });
    }
    fs.writeFile(DIARY_FILE, JSON.stringify(updatedEntries, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error writing diary file" });
      res.json({ message: "Diary entry deleted successfully" });
    });
  });
});

// ...existing code below...
// Add a new task
app.post("/tasks", (req, res) => {
  const newTask = req.body;
  fs.readFile(TASKS_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading file" });
    let tasks = [];
    try {
      tasks = JSON.parse(data);
    } catch (e) {
      tasks = [];
    }
    tasks.push(newTask);
    fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error writing file" });
      res.json({ message: "Task added", task: newTask });
    });
  });
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  fs.readFile(TASKS_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading file" });
    let tasks = [];
    try {
      tasks = JSON.parse(data);
    } catch (e) {
      tasks = [];
    }
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    if (tasks.length === updatedTasks.length) {
      return res.status(404).json({ error: "Task not found" });
    }
    fs.writeFile(TASKS_FILE, JSON.stringify(updatedTasks, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error writing file" });
      res.json({ message: "Task deleted successfully" });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
