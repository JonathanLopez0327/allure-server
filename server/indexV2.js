"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const REPORT_ROOT = process.env.REPORT_ROOT || path_1.default.join(__dirname, "..", "reports");
const PORT = process.env.PORT || 4000;
const app = (0, express_1.default)();
// Habilitar CORS
app.use((0, cors_1.default)());
// Configuración de multer para manejar archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Crear directorio temporal para el archivo
        const tempDir = path_1.default.join(__dirname, "temp");
        promises_1.default.mkdir(tempDir, { recursive: true }).then(() => cb(null, tempDir));
    },
    filename: (req, file, cb) => {
        // Mantener el nombre original del archivo
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Permitir solo archivos zip
        if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos ZIP'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB máximo
    }
});
/**
 * GET /api/runs
 * Devuelve una lista de los runs disponibles
 * @returns {Array} Lista de runs disponibles
 * @author: @jonathanLopez
 */
app.get("/api/runs", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dirs = yield promises_1.default.readdir(REPORT_ROOT, { withFileTypes: true });
    const runs = dirs
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
        .reverse(); // lo más reciente primero
    res.json(runs);
}));
/**
 * GET /api/runs/:id
 * Devuelve el detalle de un run
 * @param {string} id - El id del run
 * @returns {Object} Detalle del run
 * @author: @jonathanLopez
 */
app.get("/api/runs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const runDir = path_1.default.join(REPORT_ROOT, req.params.id, "allure-report");
    try {
        yield promises_1.default.access(runDir);
        res.json({ id: req.params.id, index: `/reports/${req.params.id}/allure-report/index.html` });
    }
    catch (_a) {
        res.status(404).json({ error: "Run not found" });
    }
}));
/**
 * POST /api/runs
 * Sube un nuevo reporte de Allure
 * @param {File} report - Archivo ZIP del reporte de Allure
 * @returns {Object} Información del reporte subido
 * @author: @jonathanLopez
 */
app.post("/api/runs", upload.single("report"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No se proporcionó ningún archivo" });
            return;
        }
        // Generar nombre de carpeta con formato día-mes-año-hora
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2); // Solo los últimos 2 dígitos
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const folderName = `${day}-${month}-${year}-${hour}${minute}`;
        const targetDir = path_1.default.join(REPORT_ROOT, folderName);
        // Crear directorio de destino
        yield promises_1.default.mkdir(targetDir, { recursive: true });
        // Extraer el archivo ZIP
        const extract = require('extract-zip');
        const tempFilePath = req.file.path;
        try {
            yield extract(tempFilePath, { dir: targetDir });
            // Verificar que se extrajo correctamente y contiene allure-report
            const extractedFiles = yield promises_1.default.readdir(targetDir);
            let hasAllureReport = false;
            // Primero verificar si hay allure-report directamente en el root
            for (const file of extractedFiles) {
                const filePath = path_1.default.join(targetDir, file);
                const stat = yield promises_1.default.stat(filePath);
                if (file === 'allure-report' && stat.isDirectory()) {
                    hasAllureReport = true;
                    break;
                }
            }
            if (!hasAllureReport) {
                // Si no hay allure-report en el root, buscar en subdirectorios
                let allureReportFound = false;
                for (const file of extractedFiles) {
                    const filePath = path_1.default.join(targetDir, file);
                    const stat = yield promises_1.default.stat(filePath);
                    if (stat.isDirectory()) {
                        const subFiles = yield promises_1.default.readdir(filePath);
                        if (subFiles.includes('allure-report')) {
                            // Mover allure-report al root del directorio
                            yield promises_1.default.rename(path_1.default.join(filePath, 'allure-report'), path_1.default.join(targetDir, 'allure-report'));
                            allureReportFound = true;
                            break;
                        }
                        else {
                            // Verificar si la carpeta misma contiene archivos de Allure
                            const allureFiles = ['index.html', 'data', 'widgets'];
                            const hasAllureFiles = subFiles.some(subFile => allureFiles.includes(subFile));
                            if (hasAllureFiles) {
                                // La carpeta es el reporte de Allure, renombrarla
                                yield promises_1.default.rename(filePath, path_1.default.join(targetDir, 'allure-report'));
                                allureReportFound = true;
                                break;
                            }
                        }
                    }
                }
                if (!allureReportFound) {
                    throw new Error('El archivo ZIP no contiene un reporte de Allure válido');
                }
            }
            // Limpiar archivo temporal
            yield promises_1.default.unlink(tempFilePath);
            res.json({
                success: true,
                id: folderName,
                message: `Reporte subido exitosamente en la carpeta: ${folderName}`,
                index: `/reports/${folderName}/allure-report/index.html`
            });
        }
        catch (extractError) {
            // Limpiar en caso de error
            yield promises_1.default.rm(targetDir, { recursive: true, force: true });
            yield promises_1.default.unlink(tempFilePath).catch(() => { });
            throw extractError;
        }
    }
    catch (error) {
        console.error('Error al procesar el reporte:', error);
        res.status(500).json({
            error: "Error al procesar el reporte",
            details: error instanceof Error ? error.message : "Error desconocido"
        });
    }
}));
/**
 * Servir archivos Allure sin tocar nada
 * @author: @jonathanLopez
 */
app.use("/reports", express_1.default.static(REPORT_ROOT, {
    extensions: ["html"],
    fallthrough: false,
}));
app.listen(PORT, () => {
    console.log(`Allure portal running on http://localhost:${PORT}`);
});
