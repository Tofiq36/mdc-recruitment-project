import mongoose from 'mongoose';

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

export default Candidate;