import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  IconButton,
  Box,
  Button,
  Alert,
  LinearProgress,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";

const Home: React.FC = () => {
  const [runs, setRuns] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/runs");
      const data = await response.json();
      setRuns(data);
    } catch (error) {
      console.error("Failed to fetch runs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("report") as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      setUploadError("Selecciona un archivo .zip");
      return;
    }
    const file = fileInput.files[0];
    if (!file.name.endsWith(".zip")) {
      setUploadError("El archivo debe ser .zip");
      return;
    }
    const formData = new FormData();
    formData.append("report", file);
    setUploading(true);
    try {
      const res = await fetch("http://localhost:4000/api/runs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Error al subir el archivo");
      } else {
        setUploadSuccess(data.message || "Reporte subido exitosamente");
        fetchRuns();
        form.reset();
      }
    } catch (err) {
      setUploadError(`Error de red al subir el archivo: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Allure Runs
          </Typography>
          <IconButton color="inherit" onClick={fetchRuns} title="Refresh list">
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subir nuevo reporte (.zip)
          </Typography>
          <Box component="form" onSubmit={handleUpload} display="flex" alignItems="center" gap={2}>
            <input
              type="file"
              name="report"
              accept=".zip"
              style={{ display: "inline-block" }}
              disabled={uploading}
              required
            />
            <Button type="submit" variant="contained" disabled={uploading}>
              Subir
            </Button>
          </Box>
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
          {uploadSuccess && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccess}</Alert>}
        </Paper>
        <Paper elevation={3} sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : runs.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="body1">No runs available.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {runs.map((id, idx) => (
                <React.Fragment key={id}>
                  <ListItemButton component={RouterLink} to={`/runs/${id}`}>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary={id} />
                  </ListItemButton>
                  {idx !== runs.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Home;
