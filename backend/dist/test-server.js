"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const pdfParse = require('pdf-parse');
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
app.post('/api/explain-contract', upload.single('contract'), async (req, res) => {
    try {
        console.log('Upload received:', req.file);
        if (req.file) {
            const dataBuffer = fs_1.default.readFileSync(req.file.path);
            const data = await pdfParse(dataBuffer);
            console.log('Parsed text:', data.text.substring(0, 100));
            fs_1.default.unlinkSync(req.file.path);
            res.json({ success: true, data: data.text.substring(0, 100) });
        }
        else {
            res.status(400).json({ error: 'No file' });
        }
    }
    catch (e) {
        console.error('SERVER ERROR!', e);
        res.status(500).json({ success: false, error: 'Failed' });
    }
});
app.listen(3002, () => console.log('Test server on 3002'));
