const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse').default || require('pdf-parse'); // Fix for pdf-parse v2+
const mammoth = require('mammoth'); // parses DOCX
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// ---- Multer setup ----
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// ---- Route: Upload Resume ----
app.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = req.file.path;
        const ext = path.extname(filePath).toLowerCase();
        let extractedText = '';

        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer); // ✅ fixed
            extractedText = data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        console.log('✅ Extracted Text Preview:\n', extractedText.slice(0, 200));
        res.json({ text: extractedText });

    } catch (err) {
        console.error('❌ Full Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// ---- Start Server ----
app.listen(5000, () => console.log('✅ Server running on port 5000'));
