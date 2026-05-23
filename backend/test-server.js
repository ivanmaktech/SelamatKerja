
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/explain-contract', upload.single('contract'), async (req, res) => {
    try {
        console.log('Upload received:', req.file);
        if (req.file) {
            const dataBuffer = new Uint8Array(fs.readFileSync(req.file.path));
            const doc = await pdfjsLib.getDocument(dataBuffer).promise;
            console.log('Parsed text PDFJS successfully');
            fs.unlinkSync(req.file.path);
            res.json({ success: true, data: 'Ok' });
        } else {
            res.status(400).json({ error: 'No file' });
        }
    } catch (e) {
        console.error('SERVER ERROR!', e);
        res.status(500).json({ success: false, error: 'Failed' });
    }
});
app.listen(3002, () => console.log('Test server on 3002'));

