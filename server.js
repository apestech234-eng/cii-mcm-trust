const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const ADMIN_KEY = 'CiiMcmTrust2026!';

// Set up storage directories
const dataDir = path.join(__dirname, 'secure_data');
const proofsDir = path.join(dataDir, 'bpl_proofs');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true });
}

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, proofsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const random = Math.floor(Math.random() * 100000000).toString(16);
        const safeName = `bpl_proof_${timestamp}_${random}${ext}`;
        cb(null, safeName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
        
        if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'));
        }
    }
});

// Body parsing for non-multipart forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper for CSV escaping
function toCsvRow(array) {
    return array.map(val => {
        let str = String(val === null || val === undefined ? '' : val);
        str = str.replace(/"/g, '""');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            str = `"${str}"`;
        }
        return str;
    }).join(',') + '\n';
}

// Handle application submission
app.post('/submit_application.php', (req, res) => {
    upload.single('bpl_proof')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { name, phone, email, qualification, course, category, bpl, message } = req.body;

        // Required fields validation
        if (!name || !phone || !email || !qualification || !course || !category || !bpl) {
            return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
        }

        // Validate Indian phone number
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
        }

        // Validate BPL condition
        if (bpl === 'Yes' && !req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a valid BPL proof document.' });
        }

        let bplProofPath = 'N/A';
        if (bpl === 'Yes' && req.file) {
            const protocol = req.secure ? 'https://' : 'http://';
            const host = req.get('host');
            bplProofPath = `${protocol}${host}/download_proof.php?key=${encodeURIComponent(ADMIN_KEY)}&file=${encodeURIComponent(req.file.filename)}`;
        }

        const csvFile = path.join(dataDir, 'submissions.csv');
        const isNewFile = !fs.existsSync(csvFile);

        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const rowData = [timestamp, name, phone, email, qualification, course, category, bpl, bplProofPath, message || ''];

        try {
            let content = '';
            if (isNewFile) {
                // Write UTF-8 BOM
                content += '\xEF\xBB\xBF';
                content += toCsvRow([
                    'Timestamp', 'Full Name', 'Phone Number', 'Email Address', 
                    'Qualification', 'Selected Course', 'Category', 'BPL Status', 
                    'BPL Proof Link', 'Additional Message'
                ]);
            }
            content += toCsvRow(rowData);

            fs.appendFileSync(csvFile, content, 'utf8');
            res.json({ success: true, message: 'Your application has been received. Thank you!' });
        } catch (writeErr) {
            console.error(writeErr);
            res.status(500).json({ success: false, message: 'Failed to save application. Please try again.' });
        }
    });
});

// Secure proof download endpoint
app.get('/download_proof.php', (req, res) => {
    const { key, file } = req.query;

    if (key !== ADMIN_KEY) {
        return res.status(403).send('Access Denied: Invalid Security Key.');
    }

    if (!file || !/^[a-zA-Z0-9_\-\.]+$/.test(file) || !file.startsWith('bpl_proof_')) {
        return res.status(400).send('Bad Request: Invalid file specified.');
    }

    const filePath = path.join(proofsDir, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File Not Found: The requested proof document does not exist.');
    }

    res.download(filePath, file);
});

// Secure CSV export endpoint
app.get('/export.php', (req, res) => {
    const { key } = req.query;

    if (key !== ADMIN_KEY) {
        return res.status(403).send('Access Denied: Invalid Security Key.');
    }

    const csvFile = path.join(dataDir, 'submissions.csv');

    if (!fs.existsSync(csvFile)) {
        return res.status(404).send('No Submissions Found.');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=cii_mcm_applications_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.csv`);
    res.download(csvFile);
});

// Handle contact query submission
const handleContactSubmit = (req, res) => {
    const { name, phone, email, subject, message } = req.body;

    // Required fields validation
    if (!name || !phone || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
    }

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const csvFile = path.join(dataDir, 'contacts.csv');
    const isNewFile = !fs.existsSync(csvFile);

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const rowData = [timestamp, name, phone, email, subject, message || ''];

    try {
        let content = '';
        if (isNewFile) {
            // Write UTF-8 BOM
            content += '\xEF\xBB\xBF';
            content += toCsvRow([
                'Timestamp', 'Full Name', 'Phone Number', 'Email Address', 
                'Subject', 'Message'
            ]);
        }
        content += toCsvRow(rowData);

        fs.appendFileSync(csvFile, content, 'utf8');
        res.json({ success: true, message: 'Your message has been received. Thank you!' });
    } catch (writeErr) {
        console.error(writeErr);
        res.status(500).json({ success: false, message: 'Failed to save contact query. Please try again.' });
    }
};

app.post('/submit_contact.php', handleContactSubmit);
app.post('/submit_contact', handleContactSubmit);

// Secure Contacts CSV export endpoint
app.get('/export_contacts.php', (req, res) => {
    const { key } = req.query;

    if (key !== ADMIN_KEY) {
        return res.status(403).send('Access Denied: Invalid Security Key.');
    }

    const csvFile = path.join(dataDir, 'contacts.csv');

    if (!fs.existsSync(csvFile)) {
        return res.status(404).send('No Contact Submissions Found.');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=cii_mcm_contacts_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.csv`);
    res.download(csvFile);
});

app.get('/export_contacts', (req, res) => {
    res.redirect(`/export_contacts.php?key=${encodeURIComponent(req.query.key || '')}`);
});


// Serve static files from current directory
app.use(express.static(__dirname));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` CII MCM Trust Local Development Server Started`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
