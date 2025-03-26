import React, { useState } from "react";
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
import supabase from "../../../utils/supabase";

// Define styles directly to avoid external CSS file dependency
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
  borderStyle: "solid", // Changed from dashed to solid
  borderWidth: 1,
  borderColor: isDragging
    ? theme.palette.primary.main
    : theme.palette.grey[300],
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
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [totalPages, setTotalPages] = useState("");
  const [pagesError, setPagesError] = useState("");
  const [author, setauthor] = useState("");
  const [name, setname] = useState("");
  const [publishDate, setpublishDate] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
      console.log(event.target.files);
    }
  };

  const handlesubmit = async () => {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("planahead")
      .upload(`book/${files[0].name}`, files[0]);

    if (uploadData) {
      console.log("Upload success:", uploadData.path);
      var publicUrlResponse = supabase.storage
        .from("planahead")
        .getPublicUrl(uploadData.path);

      console.log("Public URL Response:", publicUrlResponse);
      console.log("Public URL:", publicUrlResponse.data.publicUrl);
    }

    console.log({
      book_name: name,
      book_author: author,
      book_pages: totalPages,
      book_cover: publicUrlResponse.data.publicUrl,
      book_dop: publishDate,
    });

    const { error } = await supabase.from("tbl_book").insert({
      book_name: name,
      book_author: author,
      book_pages: totalPages,
      book_cover: publicUrlResponse.data.publicUrl,
      book_dop: publishDate,
    });
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
      console.log(e.dataTransfer.files);
    }
  };

  const handlePagesChange = (e) => {
    const value = e.target.value;
    setTotalPages(value);

    // Validate that pages is a positive number
    if (value !== "" && parseInt(value) < 1) {
      setPagesError("Pages must be at least 1");
    } else {
      setPagesError("");
    }
  };

  return (
    <StyledForm elevation={0} sx={{ mb: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        Add New Book
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="bookName"
            label="Name of Book"
            variant="outlined"
            size="small"
            onChange={(e) => setname(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="author"
            label="Author"
            variant="outlined"
            size="small"
            onChange={(e) => setauthor(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="totalPages"
            label="Total Pages"
            variant="outlined"
            size="small"
            type="number"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            error={!!pagesError}
            helperText={pagesError}
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="publishDate"
            label="Date of Publish"
            variant="outlined"
            size="small"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setpublishDate(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* File Upload Card */}
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
                ? `${files.length} ${
                    files.length === 1 ? "file" : "files"
                  } selected`
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

      {/* Hidden file input */}
      <VisuallyHiddenInput
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        multiple
      />

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handlesubmit}
          sx={{
            borderRadius: 2,
            px: 3,
            backgroundColor: "#333", // Off-black color
            "&:hover": {
              backgroundColor: "#444", // Slightly lighter on hover
            },
          }}
        >
          Add Book
        </Button>
      </Box>
    </StyledForm>
  );
};

export default Bookadd;
