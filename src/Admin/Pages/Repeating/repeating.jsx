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

// Styled components
const StyledForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: "0 auto",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  borderRadius: 12,
}));

const Repeating = () => {
  // Form states
  const [recurName, setRecurName] = useState("");
  const [recurringItems, setRecurringItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecurringItems();
  }, []);

  // SELECT - Fetch all recurring items
  const fetchRecurringItems = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_recur")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecurringItems(data);
    } catch (error) {
      console.error("Error fetching recurring items:", error.message);
    }
  };

  // INSERT - Handle form submission
  const handleSubmit = async () => {
    try {
      if (!recurName) {
        alert("Please enter a recurring item name");
        return;
      }

      const recurringData = {
        recur_name: recurName,
      };

      const { error: insertError } = await supabase
        .from("tbl_recur")
        .insert(recurringData);

      if (insertError) throw new Error("Insert failed: " + insertError.message);

      // Reset form and refresh recurring items list
      setRecurName("");
      setShowForm(false);
      fetchRecurringItems();
      alert("Recurring item added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add recurring item: " + error.message);
    }
  };

  // DELETE - Handle recurring item deletion
  const handleDelete = async (recurId) => {
    try {
      const { error: deleteError } = await supabase
        .from("tbl_recur")
        .delete()
        .eq("id", recurId);

      if (deleteError) throw new Error("Delete failed: " + deleteError.message);

      fetchRecurringItems();
      alert("Recurring item deleted successfully!");
    } catch (error) {
      console.error("Error deleting recurring item:", error);
      alert("Failed to delete recurring item: " + error.message);
    }
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
          Create New Recurring Item
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
                New Recurring Item Registration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Recurring Item Name"
                    variant="outlined"
                    size="small"
                    value={recurName}
                    onChange={(e) => setRecurName(e.target.value)}
                  />
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
                  Save Recurring Item
                </Button>
              </Box>
            </StyledForm>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurring Items List */}
      <Box sx={{ maxWidth: 600, margin: "0 auto" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Recurring Items Management
        </Typography>
        {recurringItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={10}>
                    <Typography variant="subtitle1">{item.recur_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(item.id)}
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

export default Repeating;