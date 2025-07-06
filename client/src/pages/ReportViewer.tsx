import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * ReportViewer – muestra un Allure Report incrustado a pantalla completa
 * con un AppBar minimal y botón de regreso.
 *
 * Para que realmente ocupe cada pixel:
 *   1. Asegúrate de tener <CssBaseline /> añadido en tu App raíz.
 *   2. html,body,#root deben tener height: 100%; (CssBaseline ya lo hace).
 *   3. Usamos position: fixed en el contenedor de nivel superior para eliminar
 *      cualquier padding/margin heredado.
 */
const ReportViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) return null;

  const url = `http://localhost:4000/reports/${id}/allure-report/index.html`;

  // Altura estándar de la AppBar en MUI = 64px (desktop), 56px (mobile).
  // Usamos flexbox para evitar cálculos y cubrir ambas.
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0, // top 0, right 0, bottom 0, left 0
        display: "flex",
        flexDirection: "column",
        m: 0,
        p: 0,
        height: "100dvh", // soporte para dispositivos con barra de URL
        width: "100dvw",
      }}
    >
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ flexShrink: 0, bgcolor: "#1e1e1e", color: "#fff"}}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate("/")}
            size="large"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" noWrap sx={{ ml: 1 }}>
            Allure Report – {id}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Iframe */}
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <iframe
          title={`Allure ${id}`}
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </Box>
    </Box>
  );
};

export default ReportViewer;
