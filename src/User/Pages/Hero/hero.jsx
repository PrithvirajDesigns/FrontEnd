import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Add, Close } from "@mui/icons-material";
import supabase from "../../../utils/supabase";

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
    h2: {
      fontSize: "1.5rem",
      fontWeight: 500,
      marginBottom: "1rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          padding: "8px 16px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
  },
});

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
};

const Hero = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showAddLinkDialog, setShowAddLinkDialog] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [quickLinks, setQuickLinks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const userId = sessionStorage.getItem("uid");

  useEffect(() => {
    const savedLinks = localStorage.getItem('quickLinks');
    if (savedLinks) {
      try {
        setQuickLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse saved links", e);
      }
    }
    fetchRecentBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
  }, [quickLinks]);

  const fetchRecentBooks = async () => {
    try {
      const { data: trackerData, error: trackerError } = await supabase
        .from("tbl_booktracker")
        .select("book_id, booktracker_details, booktracker_date")
        .eq("user_id", userId)
        .order("booktracker_date", { ascending: false })
        .limit(5);

      if (trackerError) throw trackerError;

      const bookIds = trackerData.map((t) => t.book_id);
      if (bookIds.length === 0) {
        setRecentBooks([]);
        return;
      }

      const { data: bookData, error: bookError } = await supabase
        .from("tbl_book")
        .select("id, book_name, book_pages, book_cover")
        .in("id", bookIds);

      if (bookError) throw bookError;

      const combinedBooks = bookData.map((book) => {
        const tracker = trackerData.find((t) => t.book_id === book.id);
        return {
          id: book.id,
          title: book.book_name,
          totalPages: book.book_pages,
          coverUrl: book.book_cover,
          readPages: tracker ? parseInt(tracker.booktracker_details) || 0 : 0,
          updatedAt: tracker ? new Date(tracker.booktracker_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }) : 'Unknown',
          progress: Math.round((tracker ? parseInt(tracker.booktracker_details) || 0 : 0) / book.book_pages * 100)
        };
      });

      setRecentBooks(combinedBooks);
    } catch (error) {
      console.error("Error fetching recent books:", error.message);
      showSnackbar("Failed to fetch recent books", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddLink = () => {
    if (newLink.name && newLink.url) {
      try {
        let processedUrl = newLink.url;
        if (!/^https?:\/\//i.test(processedUrl)) {
          processedUrl = `https://${processedUrl}`;
        }

        const faviconUrl = getFaviconUrl(processedUrl);
        
        const newLinkObj = {
          id: Date.now(),
          name: newLink.name,
          url: processedUrl,
          favicon: faviconUrl,
        };

        setQuickLinks([...quickLinks, newLinkObj]);
        setNewLink({ name: "", url: "" });
        setShowAddLinkDialog(false);
      } catch (error) {
        console.error("Error adding link:", error);
      }
    }
  };

  const handleRemoveLink = (id) => {
    setQuickLinks(quickLinks.filter((link) => link.id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Typography variant="h1" component="h1" color="text.primary">
            My Space
          </Typography>

          {/* Quick Links Section */}
          <Paper elevation={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h2">Quick Links</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddLinkDialog(true)}
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Link
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "16px",
                minHeight: "120px",
              }}
            >
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      "&:hover .remove-button": {
                        opacity: 1,
                      },
                    }}
                  >
                    <IconButton
                      className="remove-button"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "background.paper",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        zIndex: 1,
                        "&:hover": {
                          backgroundColor: "background.paper",
                        },
                      }}
                      onClick={() => handleRemoveLink(link.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    <Button
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        p: 2,
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        borderRadius: "12px",
                      }}
                    >
                      {link.favicon ? (
                        <Avatar
                          src={link.favicon}
                          alt=""
                          sx={{ width: 32, height: 32, mb: 1 }}
                          variant="square"
                        />
                      ) : (
                        <Box sx={{ fontSize: "32px", mb: 1 }}>🔗</Box>
                      )}
                      <Typography variant="body2" sx={{ textAlign: "center" }}>
                        {link.name}
                      </Typography>
                    </Button>
                  </Box>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    height: "100%",
                    minHeight: "120px",
                    borderStyle: "dashed",
                    borderColor: "rgba(0, 0, 0, 0.12)",
                  }}
                  onClick={() => setShowAddLinkDialog(true)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Add fontSize="large" />
                    <Typography variant="body2">Add Link</Typography>
                  </Box>
                </Button>
              </motion.div>
            </Box>
          </Paper>

          {/* Recently Updated Books Section */}
          <Paper elevation={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h2">Recently Updated Books</Typography>
              <Button
                variant="contained"
                component="a"
                href="/book-tracker"
                compnent={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {recentBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: "12px",
                    }}
                  >
                    <Box 
                      component="a"
                      href={`/book-tracker?book=${book.id}`}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        textDecoration: "none",
                        color: "inherit"
                      }}
                    >
                      {book.coverUrl ? (
                        <Box 
                          component="img"
                          src={book.coverUrl}
                          alt={book.title}
                          sx={{ 
                            width: '100%', 
                            height: 'auto',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            mb: 1,
                            alignSelf: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.05)'
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: '100%', 
                          height: '160px', 
                          backgroundColor: 'rgba(0,0,0,0.1)', 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: '8px',
                          mb: 1
                        }}>
                          <Typography variant="body2">No Cover</Typography>
                        </Box>
                      )}
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {book.title}
                      </Typography>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={book.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Chip
                          label={`${book.progress}%`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Updated ${book.updatedAt}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </Box>

      {/* Add Link Dialog */}
      <Dialog
        open={showAddLinkDialog}
        onClose={() => setShowAddLinkDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Quick Link</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="example.com"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddLinkDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddLink}
            variant="contained"
            disabled={!newLink.name || !newLink.url}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>

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

export default Hero;