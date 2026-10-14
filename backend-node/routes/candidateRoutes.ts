import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import Candidate from '../models/Candidate.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Route to analyze new resume
router.post('/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobDescription, jobTitle, candidateName, candidateEmail } = req.body;
        const file = req.file;

        if (!file || !jobDescription || !candidateName || !candidateEmail) {
            res.status(400).json({ error: 'Please provide all required fields and a resume file.' });
            return;
        }

        const parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        const resumeText = result.text;

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

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) throw new Error("AI did not return a response.");

        const aiResult = JSON.parse(response.text);

        const newCandidate = new Candidate({
            name: candidateName,
            email: candidateEmail,
            jobTitle: jobTitle,
            score: aiResult.score,
            missingSkills: aiResult.missingSkills,
            interviewQuestions: aiResult.interviewQuestions
        });
        
        await newCandidate.save();

        res.json(aiResult);
    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});

// 2. Route to fetch past candidates
router.get('/candidates', async (req: Request, res: Response) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.json(candidates);
    } catch (error) {
        console.error("Database fetch error:", error);
        res.status(500).json({ error: 'Failed to fetch candidate history' });
    }
});

export default router;