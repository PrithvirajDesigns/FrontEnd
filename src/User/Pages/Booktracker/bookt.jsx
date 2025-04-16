import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import supabase from "../../../utils/supabase"; // Adjust path as needed

const theme = createTheme({
  palette: {
    background: {
      default: "#f5f5f5",
    },
    primary: {
      main: "#212121",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 400,
      borderBottom: "1px solid #e0e0e0",
      paddingBottom: "0.5rem",
      marginBottom: "2rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          height: "6px",
        },
      },
    },
  },
});

const Bookt = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagesRead, setPagesRead] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [trackedBooks, setTrackedBooks] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get user ID from sessionStorage (uid for users)
  const userId = sessionStorage.getItem("uid");

  useEffect(() => {
    fetchAllBooks();
    fetchTrackedBooks();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // SELECT - Fetch all books from tbl_book
  const fetchAllBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_book")
        .select("id, book_name, book_pages");

      if (error) throw error;

      setAllBooks(
        data.map((book) => ({
          id: book.id,
          title: book.book_name,
          totalPages: book.book_pages,
        }))
      );
    } catch (error) {
      console.error("Error fetching all books:", error.message);
      showSnackbar("Failed to fetch books", "error");
    }
  };

  // SELECT - Fetch tracked books and their progress
  const fetchTrackedBooks = async () => {
    try {
      const { data: trackerData, error: trackerError } = await supabase
        .from("tbl_booktracker")
        .select("book_id, booktracker_details")
        .eq("user_id", userId);

      if (trackerError) throw trackerError;

      const bookIds = trackerData.map((t) => t.book_id);
      if (bookIds.length === 0) {
        setTrackedBooks([]);
        return;
      }

      const { data: bookData, error: bookError } = await supabase
        .from("tbl_book")
        .select("id, book_name, book_pages")
        .in("id", bookIds);

      if (bookError) throw bookError;

      const combinedBooks = bookData.map((book) => {
        const tracker = trackerData.find((t) => t.book_id === book.id);
        return {
          id: book.id,
          title: book.book_name,
          totalPages: book.book_pages,
          readPages: tracker ? parseInt(tracker.booktracker_details) || 0 : 0,
        };
      });

      setTrackedBooks(combinedBooks);
    } catch (error) {
      console.error("Error fetching tracked books:", error.message);
      showSnackbar("Failed to fetch tracked books", "error");
    }
  };

  // INSERT - Add book to tracker
  const handleAddToTracker = async (book) => {
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from("tbl_booktracker")
        .select("id")
        .eq("user_id", userId)
        .eq("book_id", book.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (!existingData) {
        const { error: insertError } = await supabase
          .from("tbl_booktracker")
          .insert({
            book_id: book.id,
            user_id: userId,
            booktracker_details: "0",
            booktracker_date: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        showSnackbar(`${book.title} added to your tracker!`);
        fetchTrackedBooks();
      } else {
        showSnackbar("This book is already in your tracker.", "info");
      }
    } catch (error) {
      console.error("Error adding to tracker:", error.message);
      showSnackbar("Failed to add book to tracker", "error");
    }
  };

  // INSERT/UPDATE - Update progress
  const handleUpdateProgress = async () => {
    if (!selectedBook || !pagesRead) return;

    try {
      const pages = parseInt(pagesRead);
      if (pages < 0 || pages > selectedBook.totalPages) {
        showSnackbar("Pages read must be between 0 and total pages", "warning");
        return;
      }

      const { data: existingData, error: fetchError } = await supabase
        .from("tbl_booktracker")
        .select("id")
        .eq("user_id", userId)
        .eq("book_id", selectedBook.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existingData) {
        const { error: updateError } = await supabase
          .from("tbl_booktracker")
          .update({
            booktracker_details: pages.toString(),
            booktracker_date: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tbl_booktracker")
          .insert({
            book_id: selectedBook.id,
            user_id: userId,
            booktracker_details: pages.toString(),
            booktracker_date: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      showSnackbar(
        `Updated ${selectedBook.title}: Read ${pages}/${selectedBook.totalPages} pages`
      );
      fetchTrackedBooks();
      setPagesRead("");
      setSelectedBook(null);
    } catch (error) {
      console.error("Error updating progress:", error.message);
      showSnackbar("Failed to update progress", "error");
    }
  };

  // DELETE - Remove progress
  const handleDeleteProgress = async (bookId) => {
    try {
      const { error } = await supabase
        .from("tbl_booktracker")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId);

      if (error) throw error;

      showSnackbar("Progress deleted successfully!");
      fetchTrackedBooks();
      if (selectedBook && selectedBook.id === bookId) {
        setSelectedBook(null);
        setPagesRead("");
      }
    } catch (error) {
      console.error("Error deleting progress:", error.message);
      showSnackbar("Failed to delete progress", "error");
    }
  };

  // Filter all books based on search query
  const filteredBooks = allBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h1" component="h1" color="text.primary">
            Book Tracker
          </Typography>

          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search books to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* All Books List */}
            {searchQuery && (
              <List>
                {filteredBooks.map((book) => (
                  <ListItem
                    key={book.id}
                    sx={{
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                    component={motion.div}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <ListItemText
                      primary={book.title}
                      secondary={`${book.totalPages} pages`}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleAddToTracker(book)}
                      aria-label="add to tracker"
                    >
                      <AddIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Tracked Books Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Tracked Books
            </Typography>
            <List>
              {trackedBooks.map((book) => {
                const progress = (book.readPages / book.totalPages) * 100;
                return (
                  <ListItem
                    key={book.id}
                    sx={{
                      borderRadius: "8px",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                    component={motion.div}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Box
                      width="100%"
                      display="flex"
                      justifyContent="space-between"
                    >
                      <ListItemText
                        primary={book.title}
                        secondary={`${book.readPages}/${book.totalPages} pages`}
                      />
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={`${Math.round(progress)}%`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBook(book);
                            setPagesRead(book.readPages.toString());
                          }}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProgress(book.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon
                            fontSize="small"
                            color="inherit"
                            sx={{ color: "black" }}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ width: "100%", mt: 1 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          {/* Progress Update Section with Animation */}
          <AnimatePresence>
            {selectedBook && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Update Progress: <strong>{selectedBook.title}</strong>
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                      label="Pages read"
                      type="number"
                      value={pagesRead}
                      onChange={(e) => setPagesRead(e.target.value)}
                      inputProps={{
                        min: 0,
                        max: selectedBook.totalPages,
                      }}
                      sx={{ width: "120px" }}
                    />
                    <Typography variant="body1">
                      / {selectedBook.totalPages} pages
                    </Typography>
                    <Box flexGrow={1} />
                    <Button
                      variant="contained"
                      onClick={handleUpdateProgress}
                      sx={{ px: 4, textTransform: "none" }}
                      component={motion.div}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Update
                    </Button>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (selectedBook.readPages / selectedBook.totalPages) * 100
                    }
                    sx={{ width: "100%", mt: 2 }}
                  />
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Bookt;
