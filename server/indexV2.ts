import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const REPORT_ROOT = process.env.REPORT_ROOT || path.join(__dirname, "..", "reports");
const PORT = process.env.PORT || 4000;
const app = express();

// Enable CORS
app.use(cors());

// Configuration of multer to handle files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create temporary directory for the file
    const tempDir = path.join(__dirname, "temp");
    fs.mkdir(tempDir, { recursive: true }).then(() => cb(null, tempDir));
  },
  filename: (req, file, cb) => {
    // Keep the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow only zip files
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only zip files are allowed'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB maximum
  }
});

/**
 * GET /api/runs
 * Returns a list of available runs
 * @returns {Array} List of available runs
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
 * Returns the detail of a run
 * @param {string} id - The id of the run
 * @returns {Object} Detail of the run
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
 * POST /api/runs
 * Upload a new Allure report
 * @param {File} report - zip file with allure report
 * @returns {Object} Information about the uploaded report
 * @author: @jonathanLopez
 */
app.post("/api/runs", upload.single("report"), async (req, res) => {
    console.log("Uploading report...");
  try {
    if (!req.file) {
      res.status(400).json({ error: "No se proporcionó ningún archivo" });
      return;
    }

    // Generate folder name with format day-month-year-hour
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2); // Solo los últimos 2 dígitos
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const folderName = `${day}_${month}_${year}-${hour}${minute}`;
    const targetDir = path.join(REPORT_ROOT, folderName);
    
    // Create destination directory
    await fs.mkdir(targetDir, { recursive: true });
    
    // Extract the zip file
    const extract = require('extract-zip');
    const tempFilePath = req.file.path;
    
    try {
      await extract(tempFilePath, { dir: targetDir });
      
      // Check if the report was extracted correctly and contains allure-report
      const extractedFiles = await fs.readdir(targetDir);
      let hasAllureReport = false;
      
      // First check if allure-report is directly in the root
      for (const file of extractedFiles) {
        const filePath = path.join(targetDir, file);
        const stat = await fs.stat(filePath);
        if (file === 'allure-report' && stat.isDirectory()) {
          hasAllureReport = true;
          break;
        }
      }
      
      if (!hasAllureReport) {
        // If allure-report is not found in the root, search in subdirectories or in the root
        let allureReportFound = false;
        for (const file of extractedFiles) {
          const filePath = path.join(targetDir, file);
          const stat = await fs.stat(filePath);
          if (stat.isDirectory()) {
            const subFiles = await fs.readdir(filePath);
            if (subFiles.includes('allure-report')) {
              // Move allure-report to the root of the directory
              await fs.rename(
                path.join(filePath, 'allure-report'),
                path.join(targetDir, 'allure-report')
              );
              allureReportFound = true;
              break;
            } else {
              // Verificar si la carpeta misma contiene archivos de Allure
              const allureFiles = ['index.html', 'data', 'widgets'];
              const hasAllureFiles = subFiles.some(subFile => allureFiles.includes(subFile));
              if (hasAllureFiles) {
                // The folder is the allure report, rename it
                await fs.rename(
                  filePath,
                  path.join(targetDir, 'allure-report')
                );
                allureReportFound = true;
                break;
              }
            }
          }
        }
        // NEW: If allure-report is not found, but the files are in the root, move them to allure-report
        if (!allureReportFound) {
          const allureFiles = ['index.html', 'data', 'widgets'];
          const hasAllureFilesInRoot = extractedFiles.some(file => allureFiles.includes(file));
          if (hasAllureFilesInRoot) {
            const allureReportDir = path.join(targetDir, 'allure-report');
            await fs.mkdir(allureReportDir);
            for (const file of extractedFiles) {
              await fs.rename(
                path.join(targetDir, file),
                path.join(allureReportDir, file)
              );
            }
            allureReportFound = true;
          }
        }
        if (!allureReportFound) {
          throw new Error('El archivo ZIP no contiene un reporte de Allure válido');
        }
      }
      
      // Clean up temporary file
      await fs.unlink(tempFilePath);
      
      res.json({
        success: true,
        id: folderName,
        message: `Reporte subido exitosamente en la carpeta: ${folderName}`,
        index: `/reports/${folderName}/allure-report/index.html`
      });
      console.log("Report uploaded successfully");
      
    } catch (extractError) {
      // Limpiar en caso de error
      await fs.rm(targetDir, { recursive: true, force: true });
      await fs.unlink(tempFilePath).catch(() => {});
      throw extractError;
    }
    
  } catch (error) {
    console.error('Error al procesar el reporte:', error);
    res.status(500).json({ 
      error: "Error al procesar el reporte", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    });
  }
});

/**
 * Serve Allure files without touching anything
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
