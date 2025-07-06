import express from "express";
import path from "path";
import fs from "fs/promises";

const REPORT_ROOT = process.env.REPORT_ROOT || path.join(__dirname, "..", "reports");
const PORT = process.env.PORT || 4000;
const app = express();

/**
 * GET /api/runs
 * Devuelve una lista de los runs disponibles
 * @returns {Array} Lista de runs disponibles
 * @author: @jonathanLopez
 */
app.get("/api/runs", async (_, res) => {
  const dirs = await fs.readdir(REPORT_ROOT, { withFileTypes: true });
  const runs = dirs
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();                         // lo más reciente primero
  res.json(runs);
});

/**
 * GET /api/runs/:id
 * Devuelve el detalle de un run
 * @param {string} id - El id del run
 * @returns {Object} Detalle del run
 * @author: @jonathanLopez
 */
app.get("/api/runs/:id", async (req, res) => {
  const runDir = path.join(REPORT_ROOT, req.params.id, "allure-report");
  try {
    await fs.access(runDir);
    res.json({ id: req.params.id, index: `/reports/${req.params.id}/allure-report/index.html` });
  } catch {
    res.status(404).json({ error: "Run not found" });
  }
});

/**
 * Servir archivos Allure sin tocar nada
 * @author: @jonathanLopez
 */
app.use(
  "/reports",
  express.static(REPORT_ROOT, {
    extensions: ["html"],
    fallthrough: false,
  })
);

app.listen(PORT, () => {
  console.log(`Allure portal running on http://localhost:${PORT}`);
});
