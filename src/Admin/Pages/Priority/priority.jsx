import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, CardContent } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import supabase from "../../../utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { SketchPicker } from "react-color"; // Add react-color for color picker

// Styled components
const StyledForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: "0 auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  borderRadius: 12,
}));

const Priority = () => {
  // Form states
  const [priorityName, setPriorityName] = useState("");
  const [priorityColor, setPriorityColor] = useState("#000000"); // Default to black
  const [priorities, setPriorities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    fetchPriorities();
  }, []);

  // SELECT - Fetch all priorities
  const fetchPriorities = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_priority")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPriorities(data);
    } catch (error) {
      console.error("Error fetching priorities:", error.message);
    }
  };

  // INSERT - Handle form submission
  const handleSubmit = async () => {
    try {
      if (!priorityName || !priorityColor) {
        alert("Please fill in all required fields");
        return;
      }

      const priorityData = {
        priority_name: priorityName,
        priority_color: priorityColor,
      };

      const { error: insertError } = await supabase
        .from("tbl_priority")
        .insert(priorityData);

      if (insertError) throw new Error("Insert failed: " + insertError.message);

      // Reset form and refresh priorities list
      setPriorityName("");
      setPriorityColor("#000000");
      setShowForm(false);
      fetchPriorities();
      alert("Priority added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add priority: " + error.message);
    }
  };

  // DELETE - Handle priority deletion
  const handleDelete = async (priorityId) => {
    try {
      const { error: deleteError } = await supabase
        .from("tbl_priority")
        .delete()
        .eq("id", priorityId);

      if (deleteError) throw new Error("Delete failed: " + deleteError.message);

      fetchPriorities();
      alert("Priority deleted successfully!");
    } catch (error) {
      console.error("Error deleting priority:", error);
      alert("Failed to delete priority: " + error.message);
    }
  };

  // Handle color change from picker
  const handleColorChange = (color) => {
    setPriorityColor(color.hex);
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Plus Button */}
      <Box sx={{ maxWidth: 600, margin: "0 auto", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setShowForm(true)}
          sx={{
            borderRadius: 2,
            backgroundColor: "#333",
            "&:hover": { backgroundColor: "#444" },
          }}
        >
          Create New Priority
        </Button>
      </Box>

      {/* Animated Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <StyledForm elevation={0} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                New Priority Registration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Priority Title"
                    variant="outlined"
                    size="small"
                    value={priorityName}
                    onChange={(e) => setPriorityName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: "relative" }}>
                    <TextField
                      fullWidth
                      label="Priority Color"
                      variant="outlined"
                      size="small"
                      value={priorityColor}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: priorityColor,
                              mr: 1,
                              borderRadius: 1,
                            }}
                          />
                        ),
                      }}
                    />
                    {showColorPicker && (
                      <Box sx={{ position: "absolute", zIndex: 2, mt: 1 }}>
                        <SketchPicker
                          color={priorityColor}
                          onChangeComplete={handleColorChange}
                        />
                        <Button
                          onClick={() => setShowColorPicker(false)}
                          sx={{ mt: 1, width: "100%" }}
                        >
                          Close
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowForm(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleSubmit}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    backgroundColor: "#333",
                    "&:hover": { backgroundColor: "#444" },
                  }}
                >
                  Save Priority
                </Button>
              </Box>
            </StyledForm>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priorities List */}
      <Box sx={{ maxWidth: 600, margin: "0 auto" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Priority Management
        </Typography>
        {priorities.map((priority) => (
          <motion.div
            key={priority.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: priority.priority_color,
                      }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="subtitle1">{priority.priority_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Color Code: {priority.priority_color}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(priority.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(priority.id)}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default Priority;