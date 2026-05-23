
import express from 'express';
import multer from 'multer';
import fs from 'fs';
const pdfParse = require('pdf-parse');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/explain-contract', upload.single('contract'), async (req, res) => {
    try {
        console.log('Upload received:', req.file);
        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdfParse(dataBuffer);
            console.log('Parsed text:', data.text.substring(0, 100));
            fs.unlinkSync(req.file.path);
            res.json({ success: true, data: data.text.substring(0, 100) });
        } else {
            res.status(400).json({ error: 'No file' });
        }
    } catch (e) {
        console.error('SERVER ERROR!', e);
        res.status(500).json({ success: false, error: 'Failed' });
    }
});
app.listen(3002, () => console.log('Test server on 3002'));

