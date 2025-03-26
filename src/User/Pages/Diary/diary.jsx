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
import { CalendarToday } from "@mui/icons-material";
import moment from "moment";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";

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

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose focus:outline-none min-h-full",
      },
    },
  });

  const loadEntry = useCallback(() => {
    try {
      const entries = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
      const entry = entries[date.format("YYYY-MM-DD")] || "";
      if (editor) {
        editor.commands.setContent(entry);
        setHasEntry(!!entry);
      }
    } catch (error) {
      console.error("Error loading diary entry:", error);
      localStorage.removeItem("diaryEntries");
    }
  }, [date, editor]);

  const handleSave = useCallback(() => {
    if (!editor) return;
    try {
      const entries = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
      const entryContent = editor.getHTML();
      if (entryContent.trim() !== "<p></p>") {
        entries[date.format("YYYY-MM-DD")] = entryContent;
        localStorage.setItem("diaryEntries", JSON.stringify(entries));
        setHasEntry(true);
      }
    } catch (error) {
      console.error("Error saving diary entry:", error);
      alert("Failed to save diary entry. Please try again.");
    }
  }, [date, editor]);

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

          <Box display="flex" justifyContent="flex-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
          line-height: 1.6;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </ThemeProvider>
  );
};

export default Diary;
