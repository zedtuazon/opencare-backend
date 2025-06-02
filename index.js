// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Opencare Backend is running');
});

// Your POST /submit endpoint here (example)
app.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    // TODO: Send email or save data
    res.status(200).json({ message: 'Form received', data });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
