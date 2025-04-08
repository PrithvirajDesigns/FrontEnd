import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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

const FileUploadCard = styled(Card)(({ theme, isDragging }) => ({
  width: "100%",
  height: 150,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: isDragging ? theme.palette.primary.main : theme.palette.grey[300],
  backgroundColor: isDragging ? "rgba(25, 118, 210, 0.04)" : "transparent",
  transition: "all 0.2s ease-in-out",
  marginTop: theme.spacing(2),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Bookadd = () => {
  // Form states
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [totalPages, setTotalPages] = useState("");
  const [pagesError, setPagesError] = useState("");
  const [author, setAuthor] = useState("");
  const [name, setName] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_book")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!name || !author || !totalPages || !files.length) {
        alert("Please fill all required fields");
        return;
      }

      const file = files[0];
      const filePath = `book/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("planahead")
        .upload(filePath, file);

      if (uploadError) throw new Error("Upload failed: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("planahead")
        .getPublicUrl(filePath);

      const bookData = {
        book_name: name,
        book_author: author,
        book_pages: parseInt(totalPages),
        book_cover: publicUrl,
        book_dop: publishDate || null,
      };

      const { error: insertError } = await supabase
        .from("tbl_book")
        .insert(bookData);

      if (insertError) throw new Error("Insert failed: " + insertError.message);

      setFiles([]);
      setName("");
      setAuthor("");
      setTotalPages("");
      setPublishDate("");
      setShowForm(false); // Hide form after submission
      fetchBooks();
      alert("Book added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add book: " + error.message);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      const { data: book, error: fetchError } = await supabase
        .from("tbl_book")
        .select("book_cover")
        .eq("id", bookId)
        .single();

      if (fetchError) throw new Error("Book not found: " + fetchError.message);

      if (book.book_cover) {
        const filePath = book.book_cover.split("/").slice(-2).join("/");
        const { error: storageError } = await supabase.storage
          .from("planahead")
          .remove([filePath]);
        if (storageError) console.warn("Failed to delete cover:", storageError.message);
      }

      const { error: deleteError } = await supabase
        .from("tbl_book")
        .delete()
        .eq("id", bookId);

      if (deleteError) throw new Error("Delete failed: " + deleteError.message);

      fetchBooks();
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book: " + error.message);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePagesChange = (e) => {
    const value = e.target.value;
    setTotalPages(value);
    if (value !== "" && parseInt(value) < 1) {
      setPagesError("Pages must be at least 1");
    } else {
      setPagesError("");
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
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
          Add New Book
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
                Add New Book
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name of Book"
                    variant="outlined"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Author"
                    variant="outlined"
                    size="small"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Pages"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={totalPages}
                    onChange={handlePagesChange}
                    error={!!pagesError}
                    helperText={pagesError}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date of Publish"
                    variant="outlined"
                    size="small"
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <label htmlFor="fileInput">
                <FileUploadCard
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <CloudUploadIcon
                        sx={{
                          fontSize: 40,
                          color: files.length > 0 ? "primary.main" : "text.secondary",
                        }}
                      />
                      {files.length > 0 && (
                        <CheckCircleIcon
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            color: "success.main",
                            bgcolor: "background.paper",
                            borderRadius: "50%",
                            fontSize: 20,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, fontWeight: files.length > 0 ? 500 : 400 }}
                    >
                      {files.length > 0
                        ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
                        : "Upload book cover"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {files.length > 0
                        ? "Click or drag to replace"
                        : "Drag and drop or click to select"}
                    </Typography>
                  </CardContent>
                </FileUploadCard>
              </label>

              <VisuallyHiddenInput
                id="fileInput"
                type="file"
                onChange={handleFileChange}
              />

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
                  Add Book
                </Button>
              </Box>
            </StyledForm>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Books List */}
      <Box sx={{ maxWidth: 600, margin: "0 auto" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Books List
        </Typography>
        {books.map((book) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={2}>
                    {book.book_cover && (
                      <img
                        src={book.book_cover}
                        alt={book.book_name}
                        style={{ width: "100%", height: "auto" }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="subtitle1">{book.book_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {book.book_author} • {book.book_pages} pages
                    </Typography>
                    {book.book_dop && (
                      <Typography variant="body2" color="text.secondary">
                        Published: {new Date(book.book_dop).toLocaleDateString()}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
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

export default Bookadd;