require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('password', 10) }
];

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send('User not found');
  if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(400).send('Wrong password');
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  const file = req.file;
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: Date.now() + '-' + file.originalname,
    Body: file.buffer,
  };
  try {
    const data = await s3.upload(params).promise();
    res.json({ message: 'File uploaded', url: data.Location });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/files', authenticate, async (req, res) => {
  try {
    const data = await s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET }).promise();
    const files = data.Contents.map(f => f.Key);
    res.json(files);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/download/:filename', authenticate, async (req, res) => {
  const params = { Bucket: process.env.AWS_BUCKET, Key: req.params.filename };
  try {
    const file = await s3.getObject(params).promise();
    res.attachment(req.params.filename).send(file.Body);
  } catch (err) {
    res.status(404).send('File not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));