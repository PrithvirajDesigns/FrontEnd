import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CssBaseline,
  IconButton,
  Badge,
  TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CalendarToday, Delete } from "@mui/icons-material";
import moment from "moment";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";
import supabase from "../../../utils/supabase"; // Adjust path as needed

const theme = createTheme({
  palette: {
    background: { default: "#f5f5f5" },
    primary: { main: "#212121" },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 400,
      paddingBottom: "0.5rem",
      marginBottom: "2rem",
    },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: "20px" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: "12px" } } },
  },
});

const Diary = () => {
  const [date, setDate] = useState(moment());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasEntry, setHasEntry] = useState(false);
  const [title, setTitle] = useState("");

  const userId = sessionStorage.getItem("uid"); // UUID from login

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose focus:outline-none min-h-full",
      },
    },
  });

  // SELECT - Load diary entry for the selected date
  const loadEntry = useCallback(async () => {
    if (!editor || !userId) return;

    try {
      const { data, error } = await supabase
        .from("tbl_digitaldiary")
        .select("diary_head, dairy_content")
        .eq("user_id", userId)
        .eq("diary_date", date.format("YYYY-MM-DD"))
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 means no entry found

      const entry = data || { diary_head: "", dairy_content: "" };
      setTitle(entry.diary_head || "");
      editor.commands.setContent(entry.dairy_content || "");
      setHasEntry(!!entry.dairy_content);
    } catch (error) {
      console.error("Error loading diary entry:", error.message);
    }
  }, [date, editor, userId]);

  // INSERT/UPDATE - Save or update diary entry
  const handleSave = useCallback(async () => {
    if (!editor || !userId) return;

    const content = editor.getHTML();
    if (content.trim() === "<p></p>" && !title) return; // Don’t save empty entries

    try {
      const { data: existingEntry, error: fetchError } = await supabase
        .from("tbl_digitaldiary")
        .select("id")
        .eq("user_id", userId)
        .eq("diary_date", date.format("YYYY-MM-DD"))
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existingEntry) {
        // UPDATE existing entry
        const { error: updateError } = await supabase
          .from("tbl_digitaldiary")
          .update({
            diary_head: title,
            dairy_content: content,
          })
          .eq("id", existingEntry.id);

        if (updateError) throw updateError;
      } else {
        // INSERT new entry
        const { error: insertError } = await supabase.from("tbl_digitaldiary").insert({
          user_id: userId,
          diary_date: date.format("YYYY-MM-DD"),
          diary_head: title,
          dairy_content: content,
        });

        if (insertError) throw insertError;
      }

      setHasEntry(true);
      alert("Diary entry saved successfully!");
    } catch (error) {
      console.error("Error saving diary entry:", error.message);
      alert("Failed to save diary entry: " + error.message);
    }
  }, [date, editor, userId, title]);

  // DELETE - Delete diary entry
  const handleDelete = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("tbl_digitaldiary")
        .delete()
        .eq("user_id", userId)
        .eq("diary_date", date.format("YYYY-MM-DD"));

      if (error) throw error;

      setTitle("");
      editor?.commands.setContent("");
      setHasEntry(false);
      alert("Diary entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting diary entry:", error.message);
      alert("Failed to delete diary entry: " + error.message);
    }
  };

  const handleDateChange = (e) => {
    const newDate = moment(e.target.value);
    setDate(newDate);
    setShowDatePicker(false);
  };

  useEffect(() => {
    loadEntry();
  }, [date, loadEntry]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 60000);
    return () => clearInterval(autoSaveInterval);
  }, [handleSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e0e0e0",
              pb: "0.5rem",
              mb: "2rem",
            }}
          >
            <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }}>
              Digital Diary
            </Typography>

            <Badge color="primary" variant="dot" invisible={!hasEntry}>
              <IconButton
                onClick={() => setShowDatePicker(!showDatePicker)}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "8px 16px",
                }}
              >
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {date.format("MMM D, YYYY")}
                </Typography>
              </IconButton>
            </Badge>
          </Box>

          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <TextField
                  type="date"
                  value={date.format("YYYY-MM-DD")}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 220 }}
                  inputProps={{
                    max: moment().format("YYYY-MM-DD"),
                  }}
                />
              </Box>
            </motion.div>
          )}

          <Paper
            elevation={2}
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
              p: 3,
              mb: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minHeight: "70vh",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #e0e0e0",
                pb: 1,
                mb: 2,
              }}
            >
              <Typography variant="h4" color="text.secondary">
                {date.format("dddd")}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {date.format("MMMM D, YYYY")}
              </Typography>
            </Box>

            <TextField
              fullWidth
              variant="standard"
              placeholder="Entry Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  mb: 2,
                },
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ flexGrow: 1 }}>
              <EditorContent
                editor={editor}
                style={{
                  height: "100%",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                }}
              />
            </Box>

            <Box
              sx={{
                borderTop: "1px solid #e0e0e0",
                pt: 1,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Digital Diary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Page {date.format("DDMM")}
              </Typography>
            </Box>
          </Paper>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                startIcon={<Delete />}
                sx={{ px: 4, py: 1.5 }}
                disabled={!hasEntry}
              >
                Delete
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ px: 4, py: 1.5 }}
              >
                Save
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      <style>{`
        .ProseMirror {
          height: 100%;
          padding: 8px;
          outline: none;
        }
        .ProseMirror p {
          margin: 0 0 1rem 0;
          lineHeight: 1.6;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </ThemeProvider>
  );
};

export default Diary;