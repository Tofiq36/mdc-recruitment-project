import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());

// Set up Multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

// --- Database Schema ---
const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    score: { type: Number, required: true },
    missingSkills: { type: [String], default: [] },
    interviewQuestions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

// --- API Routes ---
app.get('/', (req: Request, res: Response) => {
    res.send('AI Recruitment Node Backend is running!');
});

// 1. Analyze Resume & Save to Database
app.post('/api/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobDescription, jobTitle, candidateName, candidateEmail } = req.body;
        const file = req.file;

        if (!file || !jobDescription || !candidateName || !candidateEmail) {
            res.status(400).json({ error: 'Please provide all required fields (resume, job description, name, email).' });
            return;
        }

        // Extract text from the PDF
        const parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        const resumeText = result.text;

        // The AI Prompt Strategy
        const prompt = `
            You are an expert technical recruiter. Analyze the following resume against the job description.
            
            Job Description:
            ${jobDescription}
            
            Resume:
            ${resumeText}

            Analyze the match and return strictly a valid JSON object with no markdown formatting. The JSON must contain exactly these keys:
            - "score": A number from 1 to 100 representing how well the resume matches the job.
            - "missingSkills": An array of strings highlighting critical technical skills required by the job but missing from the resume.
            - "interviewQuestions": An array of 3 specific technical interview questions to test the candidate on the job's core requirements.
        `;

        // Call the Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
            throw new Error("AI did not return a response.");
        }

        const aiResult = JSON.parse(response.text);

        // Save candidate data and AI results to MongoDB
        const newCandidate = new Candidate({
            name: candidateName,
            email: candidateEmail,
            jobTitle: jobTitle || 'Unspecified Role',
            score: aiResult.score,
            missingSkills: aiResult.missingSkills,
            interviewQuestions: aiResult.interviewQuestions
        });
        
        await newCandidate.save();

        // Send the structured AI response back to the frontend
        res.json(aiResult);

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});

// 2. Fetch Candidate History Dashboard Data
app.get('/api/candidates', async (req: Request, res: Response) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.json(candidates);
    } catch (error) {
        console.error("Database fetch error:", error);
        res.status(500).json({ error: 'Failed to fetch candidate history' });
    }
});

// --- MongoDB Connection & Server Start ---
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