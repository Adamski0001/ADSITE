const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to log IP addresses
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const log = `Visitor IP: ${ip} - ${new Date().toISOString()}\n`;
  console.log(log);

  fs.appendFile('visitor_ips.log', log, (err) => {
    if (err) console.error('Failed to log IP:', err);
  });

  next();
});

// Middleware for serving static files and parsing requests
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
const upload = multer({ dest: 'uploads/' });

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const targetPath = path.join(__dirname, 'uploads', file.originalname);

  fs.rename(file.path, targetPath, (err) => {
    if (err) return res.status(500).send('File upload failed!');
    res.redirect('/');
  });
});

// List uploaded files
app.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).send('Could not list files.');
    res.json(files);
  });
});

// Secure delete route
app.delete('/delete', (req, res) => {
  const { filename, password } = req.body;
  const ADMIN_PASSWORD = 'your_secure_password';

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).send('Unauthorized: Incorrect password.');
  }

  const filePath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send('Failed to delete file.');
    res.send(`File "${filename}" has been deleted.`);
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View IP logs
app.get('/ip-logs', (req, res) => {
  fs.readFile('visitor_ips.log', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Could not read IP logs.');
    res.type('text/plain').send(data);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
