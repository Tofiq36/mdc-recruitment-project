import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import candidateRoutes from './routes/candidateRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Make the uploads folder publicly accessible via URL
app.use('/uploads', express.static(uploadDir));

// Root test route
app.get('/', (req: Request, res: Response) => {
    res.send('AI Recruitment Node Backend is running!');
});

// Delegate all /api traffic to the router
app.use('/api', candidateRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || '';
if (mongoURI) {
    mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.log('MongoDB URI not provided yet. Skipping database connection.');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});