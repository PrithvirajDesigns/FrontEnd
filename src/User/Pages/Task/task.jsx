import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  IconButton,
  Button,
  Box,
  Paper,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { motion, AnimatePresence } from "framer-motion";

const MinimalTaskPage = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Create project roadmap", completed: false },
    { id: 2, title: "Design user interface", completed: true },
    { id: 3, title: "Implement authentication", completed: false },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
    }
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" fontWeight="600" gutterBottom>
          Tasks
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A clean space to manage what matters.
        </Typography>
      </Box>

      {/* Task Input */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          backgroundColor: "#fafafa",
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Type a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: "1rem", pl: 1 },
          }}
        />
        <Button
          variant="contained"
          onClick={addTask}
          sx={{
            textTransform: "none",
            px: 3,
            borderRadius: 2,
            boxShadow: "none",
            backgroundColor: "black",
          }}
        >
          Add
        </Button>
      </Paper>

      {/* Task List with Animations */}
      <Box display="flex" flexDirection="column" gap={1.5}>
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  backgroundColor: "#ffffff",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#f7f7f7",
                  },
                }}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    icon={
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: "2px solid #cfcfcf",
                          borderRadius: 1,
                        }}
                      />
                    }
                    checkedIcon={
                      <CheckIcon
                        sx={{
                          backgroundColor: "black",
                          color: "#fff",
                          borderRadius: 1,
                          fontSize: 20,
                          p: "2px",
                        }}
                      />
                    }
                    sx={{ mr: 2 }}
                  />
                </motion.div>
                <motion.div
                  animate={{
                    color: task.completed ? "#9e9e9e" : "#212121",
                    textDecoration: task.completed ? "line-through" : "none",
                    opacity: task.completed ? 0.6 : 1,
                    x: task.completed ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ flexGrow: 1 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    {task.title}
                  </Typography>
                </motion.div>

                <motion.div whileTap={{ scale: 0.8 }}>
                  <IconButton onClick={() => deleteTask(task.id)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default MinimalTaskPage;