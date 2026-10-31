import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    githubUsername: { type: String, default: "" },
    pdfUrl: { type: String, default: "" }, 
    
    // Core AI Results
    score: { type: Number, required: true },
    summary: { type: String, default: "" },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    interviewQuestions: { type: [String], default: [] },
    
    // GitHub API Stats
    githubStats: {
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        topLanguages: { type: [String], default: [] }
    },

    // Radar Chart Metrics
    metrics: {
        frontend: { type: Number, default: 0 },
        backend: { type: Number, default: 0 },
        database: { type: Number, default: 0 },
        systemDesign: { type: Number, default: 0 },
        softSkills: { type: Number, default: 0 }
    },
    
    createdAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;