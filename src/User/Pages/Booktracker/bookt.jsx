import React from 'react';
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
  Chip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
    },
    primary: {
      main: '#212121',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '0.5rem',
      marginBottom: '2rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '6px',
        },
      },
    },
  },
});

// Mock data
const mockBooks = [
  { id: 1, title: "The Silent Patient", totalPages: 325, readPages: 120 },
  { id: 2, title: "Atomic Habits", totalPages: 320, readPages: 45 },
];

const Bookt = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [pagesRead, setPagesRead] = React.useState("");

  const filteredBooks = mockBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateProgress = () => {
    if (!selectedBook || !pagesRead) return;
    alert(`Updated ${selectedBook.title}: Read ${pagesRead}/${selectedBook.totalPages} pages`);
    // API call would go here
  };

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
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Book List with Progress Bars */}
        <List>
          {filteredBooks.map((book) => {
            const progress = (book.readPages / book.totalPages) * 100;
            return (
              <ListItem 
                key={book.id} 
                button 
                onClick={() => {
                  setSelectedBook(book);
                  setPagesRead(book.readPages.toString());
                }}
                sx={{
                  borderRadius: '8px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
                component={motion.div}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Box width="100%" display="flex" justifyContent="space-between">
                  <ListItemText 
                    primary={book.title} 
                    secondary={`${book.readPages}/${book.totalPages} pages`} 
                  />
                  <Chip 
                    label={`${Math.round(progress)}%`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ width: '100%', mt: 1 }}
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
                    max: selectedBook.totalPages 
                  }}
                  sx={{ width: '120px' }}
                />
                <Typography variant="body1">
                  / {selectedBook.totalPages} pages
                </Typography>
                <Box flexGrow={1} />
                <Button 
                  variant="contained" 
                  onClick={handleUpdateProgress}
                  sx={{ px: 4, textTransform: 'none' }}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update
                </Button>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(selectedBook.readPages / selectedBook.totalPages) * 100} 
                sx={{ width: '100%', mt: 2 }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  </motion.div>
</ThemeProvider>

  );
};

export default Bookt;