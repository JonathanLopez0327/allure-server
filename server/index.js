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
const REPORT_ROOT = process.env.REPORT_ROOT || path_1.default.join(__dirname, "..", "reports");
const PORT = process.env.PORT || 4000;
const app = (0, express_1.default)();
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
