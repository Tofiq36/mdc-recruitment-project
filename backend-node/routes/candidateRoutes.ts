import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import Candidate from '../models/Candidate.js';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import natural from 'natural';
import sw from 'stopword';
import {
    extractTaxonomySkills,
    normalizeToCanonicalSkill,
    evaluateRoleRecommendations
} from '../data/skillTaxonomy.js';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const getBaseUrl = (): string => {
    const rawUrl =
        process.env.RENDER_EXTERNAL_URL ||
        process.env.BASE_URL ||
        `http://localhost:${process.env.PORT || 5000}`;
    return rawUrl.replace(/\/$/, '');
};

// --- HELPER: COSINE SIMILARITY BETWEEN TWO TEXTS ---
const calculateCosineSimilarity = (textA: string, textB: string): number => {
    const tokenizer = new natural.WordTokenizer();
    const tokensA = sw.removeStopwords(tokenizer.tokenize(textA.toLowerCase()) || []);
    const tokensB = sw.removeStopwords(tokenizer.tokenize(textB.toLowerCase()) || []);

    const termFreqMap = (tokens: string[]) => {
        const map: Record<string, number> = {};
        tokens.forEach((w: string) => (map[w] = (map[w] || 0) + 1));
        return map;
    };

    const mapA = termFreqMap(tokensA);
    const mapB = termFreqMap(tokensB);

    const uniqueWords = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
    let dotProduct = 0, magA = 0, magB = 0;

    uniqueWords.forEach((word: string) => {
        const vA = mapA[word] || 0;
        const vB = mapB[word] || 0;
        dotProduct += vA * vB;
        magA += vA * vA;
        magB += vB * vB;
    });

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return (dotProduct / (magA * magB)) * 100;
};

// --- HELPER: AUTO-EXTRACT NAME & EMAIL FROM RESUME TEXT ---
const extractCandidateDetailsFromResume = (
    rawText: string,
    fallbackName: string,
    fallbackEmail: string,
    filenameFallback = ''
): { name: string; email: string } => {
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const extractedEmail =
        (fallbackEmail && fallbackEmail.trim()) ||
        (emailMatch ? emailMatch[0] : fallbackEmail);

    const roleAndCompanyNoise = /\b(resume|curriculum|vitae|cv|profile|summary|objective|skills|experience|education|projects|contact|certifications|achievements|developer|engineer|designer|intern|manager|consultant|architect|specialist|analyst|lead|senior|junior|associate|technologies|technology|solutions|systems|services|labs|studio|pvt|ltd|inc|corp|llc|react|reactjs|angular|vue|node|nodejs|python|java|javascript|typescript|frontend|backend|fullstack|full-stack|mern|mean|pern|stack|proper)\b/gi;

    if (fallbackName && fallbackName.trim()) {
        return {
            name: fallbackName.trim(),
            email: extractedEmail
        };
    }

    // 1. Check explicit "Name:" label if present
    const labeledNameMatch = rawText.match(/\b(?:candidate\s*name|full\s*name|name)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{1,40})/i);
    if (labeledNameMatch && labeledNameMatch[1]) {
        const cleanedLabeled = labeledNameMatch[1]
            .replace(roleAndCompanyNoise, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (cleanedLabeled.split(/\s+/).length >= 1 && cleanedLabeled.split(/\s+/).length <= 3) {
            return {
                name: cleanedLabeled,
                email: extractedEmail
            };
        }
    }

    // 2. Scan top lines of the resume text and strip role/company words
    const lines = rawText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    for (const line of lines.slice(0, 12)) {
        if (
            line.includes('@') ||
            /https?:\/\//i.test(line) ||
            /\bwww\./i.test(line) ||
            /\+?\d[\d\s\-().]{5,}/.test(line)
        ) {
            continue;
        }

        const beforePipe = line.split(/[|•·,:/-]+/)[0]?.trim() || '';
        const stripped = beforePipe
            .replace(roleAndCompanyNoise, ' ')
            .replace(/[^A-Za-z .'-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const words = stripped.split(/\s+/).filter(Boolean);
        if (
            stripped.length >= 3 &&
            stripped.length <= 30 &&
            words.length >= 2 &&
            words.length <= 3 &&
            words.every(w => /^[A-Z][a-zA-Z.'-]*$/.test(w))
        ) {
            return {
                name: stripped,
                email: extractedEmail
            };
        }
    }

    // 3. Fallback to cleaned filename if resume text had no clear name line
    const cleanFilename = (filenameFallback || '')
        .replace(/\.pdf$/i, '')
        .replace(roleAndCompanyNoise, ' ')
        .replace(/[_-]+/g, ' ')
        .replace(/[^A-Za-z .'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return {
        name: cleanFilename || 'Candidate',
        email: extractedEmail
    };
};

// --- HELPER: NATURAL RECRUITER SUMMARY BUILDER ---
const formatListNaturally = (items: string[]): string => {
    if (items.length === 0) return 'none';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const buildProfessionalSummary = ({
    candidateName,
    score,
    requiredSkills,
    matchedSkills,
    missingSkills,
    authenticityScore
}: {
    candidateName: string;
    roleTitle?: string;
    score: number;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    authenticityScore: number;
}): string => {
    const cleanName = (candidateName || 'The candidate').trim();
    const validMatched = matchedSkills.filter(s => s && s !== 'None');

    const hasText = validMatched.length > 0
        ? `${cleanName} has ${formatListNaturally(validMatched)} (${score}% overall match).`
        : `${cleanName} has no direct match with the required skills (${score}% overall match).`;

    const neededText = requiredSkills.length > 0
        ? `The recruiter requires ${formatListNaturally(requiredSkills)}.`
        : `Evaluated against the provided job requirements.`;

    const gapText = missingSkills.length > 0
        ? `${cleanName} lacks ${formatListNaturally(missingSkills)}.`
        : `${cleanName} covers all required skills on the resume.`;

    const trustNote = authenticityScore < 80
        ? `Authenticity is ${authenticityScore}%, so review the flagged items.`
        : `Authenticity checks passed (${authenticityScore}%).`;

    return `${hasText} ${neededText} ${gapText} ${trustNote}`;
};

// --- ACCURATE SKILL & ROLE MATCHING ENGINE ---
const analyzeResumeNLP = (
    jobDesc: string,
    resumeText: string,
    context?: { candidateName?: string; roleTitle?: string; authenticityScore?: number }
) => {
    const redactPII = (text: string) => {
        return text
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED EMAIL]")
            .replace(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, "[REDACTED PHONE]")
            .replace(/https?:\/\/[^\s]+/g, "[REDACTED LINK]");
    };

    const unbiasedResumeText = redactPII(resumeText);

    // 1. Extract canonical skills & stack bundles (e.g., MERN, MEAN, Full-Stack) from JD & Resume
    let requiredSkills = extractTaxonomySkills(jobDesc, false);
    const candidateSkills = extractTaxonomySkills(unbiasedResumeText, true);

    // 2. Filtered TF-IDF fallback only if no taxonomy skills/stacks were found in JD
    if (requiredSkills.length === 0) {
        const tokenizer = new natural.WordTokenizer();
        const noiseWords = new Set([
            'need', 'needs', 'looking', 'want', 'someone', 'must', 'have', 'knows', 'know',
            'role', 'job', 'position', 'candidate', 'developer', 'engineer', 'frontend', 'backend',
            'fullstack', 'full', 'stack', 'proper', 'good', 'great', 'best', 'experience',
            'years', 'year', 'work', 'working', 'team', 'strong', 'skills', 'skill', 'ability'
        ]);
        const cleanTokens = sw
            .removeStopwords(tokenizer.tokenize(jobDesc.toLowerCase()) || [])
            .filter(w => w.length > 2 && isNaN(Number(w)) && !noiseWords.has(w));

        const tfidf = new natural.TfIdf();
        tfidf.addDocument(cleanTokens.join(' '));
        requiredSkills = tfidf
            .listTerms(0)
            .slice(0, 6)
            .map(item => normalizeToCanonicalSkill(item.term))
            .filter(term => term && !noiseWords.has(term.toLowerCase()));
    }

    const candidateSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));
    const resumeLower = unbiasedResumeText.toLowerCase();

    const matchedSkills = requiredSkills.filter(
        skill => candidateSkillSet.has(skill.toLowerCase()) || resumeLower.includes(skill.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(
        skill => !matchedSkills.some(m => m.toLowerCase() === skill.toLowerCase())
    );

    const rawTextScore = calculateCosineSimilarity(jobDesc, unbiasedResumeText);
    const skillRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 0;

    let finalScore = requiredSkills.length > 0
        ? skillRatio * 0.8 + Math.min(rawTextScore * 2, 100) * 0.2
        : Math.min(rawTextScore * 2.5, 95);

    if (requiredSkills.length > 0 && matchedSkills.length === 0) {
        finalScore = Math.min(finalScore, 10);
    }

    const generatedQuestions = missingSkills.slice(0, 3).map(skill =>
        `Can you walk through your hands-on experience with ${skill} and a real project where you used it?`
    );

    if (generatedQuestions.length === 0) {
        generatedQuestions.push(
            "Walk me through your most complex project and the trade-offs you made.",
            "How do you debug and optimize performance in production?",
            "Describe how you collaborate and review code or deliverables."
        );
    }

    const roundedScore = Math.min(100, Math.max(0, Math.round(finalScore)));
    const formattedMatched = matchedSkills.length > 0 ? matchedSkills : ["None"];

    const summary = buildProfessionalSummary({
        candidateName: context?.candidateName || 'Candidate',
        roleTitle: context?.roleTitle || 'this role',
        score: roundedScore,
        requiredSkills,
        matchedSkills: formattedMatched,
        missingSkills,
        authenticityScore: context?.authenticityScore ?? 100
    });

    return {
        score: roundedScore,
        candidateSkills,
        summary,
        matchedSkills: formattedMatched,
        missingSkills,
        interviewQuestions: generatedQuestions,
        metrics: {
            frontend: Math.min(Math.round(roundedScore + 5), 100),
            backend: Math.min(Math.round(roundedScore), 100),
            database: Math.min(Math.round(roundedScore - 5), 100),
            systemDesign: roundedScore,
            softSkills: 80
        }
    };
};

// --- AUTHENTICITY & LIE-DETECTION ENGINE ---
const runAuthenticityChecks = async (
    rawResumeText: string,
    matchedSkills: string[],
    githubUsername: string,
    githubReposData: any[]
) => {
    const redFlags: string[] = [];
    let authenticityScore = 100;

    const lowerText = rawResumeText.toLowerCase();
    const unbackedSkills: string[] = [];

    matchedSkills.forEach(skill => {
        if (skill === "None") return;
        const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        const occurrences = (lowerText.match(regex) || []).length;
        if (occurrences === 1) {
            unbackedSkills.push(skill);
        }
    });

    if (unbackedSkills.length >= 3) {
        redFlags.push(`Unbacked Skill Claims: [${unbackedSkills.slice(0, 4).join(', ')}] appear only once (possible buzzword stuffing without project context).`);
        authenticityScore -= 15;
    }

    if (githubUsername) {
        if (githubReposData.length === 0) {
            redFlags.push(`GitHub Verification: Username "${githubUsername}" has 0 public repositories or could not be found.`);
            authenticityScore -= 20;
        } else {
            const forkedCount = githubReposData.filter(repo => repo.fork).length;
            const forkRatio = forkedCount / githubReposData.length;

            if (forkRatio >= 0.7 && githubReposData.length >= 3) {
                redFlags.push(`GitHub Forensics: ${Math.round(forkRatio * 100)}% of public repos are forks (low original code evidence).`);
                authenticityScore -= 20;
            }

            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const allCreatedRecently = githubReposData.every(repo => new Date(repo.created_at).getTime() > sevenDaysAgo);
            if (allCreatedRecently && githubReposData.length >= 2) {
                redFlags.push(`GitHub Forensics: All public repositories were created within the last 7 days.`);
                authenticityScore -= 15;
            }
        }
    } else {
        redFlags.push(`GitHub Link / Username Missing: No GitHub username or link was provided for code verification.`);
        authenticityScore -= 10;
    }

    try {
        const existingCandidates = await Candidate.find({}, 'name email resumeText').limit(50);
        for (const existing of existingCandidates) {
            if (!existing.resumeText || existing.resumeText.length < 100) continue;
            const similarity = calculateCosineSimilarity(rawResumeText, existing.resumeText);
            if (similarity >= 80) {
                redFlags.push(`Duplicate/Plagiarism Alert: Resume is ${Math.round(similarity)}% identical to existing candidate "${existing.name}".`);
                authenticityScore -= 30;
                break;
            }
        }
    } catch (err) {}

    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const foundUrls = Array.from(new Set(rawResumeText.match(urlRegex) || [])).slice(0, 4);

    for (const url of foundUrls) {
        try {
            await axios.head(url, { timeout: 3000 });
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                redFlags.push(`Broken Portfolio Link: ${url} returned 404 Not Found.`);
                authenticityScore -= 10;
            }
        }
    }

    const claimedExpMatch = lowerText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience/);
    const yearMatches = rawResumeText.match(/\b(19|20)\d{2}\b/g);

    if (claimedExpMatch && yearMatches && yearMatches.length >= 2) {
        const claimedYears = parseInt(claimedExpMatch[1], 10);
        const numericYears = yearMatches.map(Number).filter(y => y <= new Date().getFullYear());
        const minYear = Math.min(...numericYears);
        const maxYear = Math.max(...numericYears);
        const timelineSpan = maxYear - minYear;

        if (claimedYears > timelineSpan + 1) {
            redFlags.push(`Timeline Inconsistency: Claims ${claimedYears} years of experience, but resume dates only span ${timelineSpan} years (${minYear}-${maxYear}).`);
            authenticityScore -= 20;
        }
    }

    return {
        authenticityScore: Math.max(authenticityScore, 0),
        redFlags: redFlags.length > 0 ? redFlags : ["No major inconsistencies detected."]
    };
};

// ----------------------------------------------

// 1. Single Analysis Route
router.post('/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobDescription, jobTitle, candidateName, candidateEmail, githubUsername } = req.body;
        const file = req.file;

        if (!file || !jobDescription) {
            res.status(400).json({ error: 'Please upload a resume and provide a job description.' });
            return;
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const savedFileName = `${uniqueSuffix}-${safeFilename}`;
        fs.writeFileSync(`uploads/${savedFileName}`, file.buffer);
        const pdfUrl = `${getBaseUrl()}/uploads/${savedFileName}`;

        let optimizedResumeText = "";
        try {
            const parser = new PDFParse({ data: file.buffer });
            const result = await parser.getText();
            optimizedResumeText = result.text.substring(0, 4500);
        } catch (pdfErr) {
            optimizedResumeText = "PDF Text Unreadable.";
        }

        const filenameFallback = file.originalname.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
        const emailFallback = `candidate-${Date.now()}@extracted.local`;
        const extractedDetails = extractCandidateDetailsFromResume(
            optimizedResumeText,
            candidateName || '',
            candidateEmail || emailFallback,
            filenameFallback
        );

        let githubStats = { publicRepos: 0, followers: 0, topLanguages: [] as string[] };
        let githubReposData: any[] = [];

        if (githubUsername) {
            try {
                const [userRes, reposRes] = await Promise.all([
                    axios.get(`https://api.github.com/users/${githubUsername}`),
                    axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`)
                ]);
                githubReposData = reposRes.data || [];
                githubStats.publicRepos = userRes.data.public_repos || 0;
                githubStats.followers = userRes.data.followers || 0;
                const langs = new Set<string>();
                githubReposData.forEach((repo: any) => { if (repo.language) langs.add(repo.language); });
                githubStats.topLanguages = Array.from(langs).slice(0, 5);
            } catch (err) {}
        }

        const preliminaryNlp = analyzeResumeNLP(jobDescription, optimizedResumeText, {
            candidateName: extractedDetails.name,
            roleTitle: jobTitle || 'this role'
        });
        const authenticity = await runAuthenticityChecks(
            optimizedResumeText,
            preliminaryNlp.matchedSkills,
            githubUsername || '',
            githubReposData
        );
        const aiResult = analyzeResumeNLP(jobDescription, optimizedResumeText, {
            candidateName: extractedDetails.name,
            roleTitle: jobTitle || 'this role',
            authenticityScore: authenticity.authenticityScore
        });
        const recommendedRoles = evaluateRoleRecommendations(
            aiResult.candidateSkills,
            jobTitle || 'Unspecified Role',
            aiResult.score
        );

        const newCandidate = new Candidate({
            name: extractedDetails.name,
            email: extractedDetails.email,
            jobTitle: jobTitle || 'Unspecified Role',
            githubUsername: githubUsername || '',
            pdfUrl,
            resumeText: optimizedResumeText,
            score: aiResult.score,
            authenticityScore: authenticity.authenticityScore,
            redFlags: authenticity.redFlags,
            summary: aiResult.summary,
            matchedSkills: aiResult.matchedSkills,
            missingSkills: aiResult.missingSkills,
            interviewQuestions: aiResult.interviewQuestions,
            recommendedRoles,
            githubStats,
            metrics: aiResult.metrics
        });

        await newCandidate.save();
        res.json(newCandidate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process the request' });
    }
});

// 2. Sequential Bulk Processing
router.post('/analyze-bulk', upload.array('resumes', 10), async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobDescription, jobTitle } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0 || !jobDescription) {
            res.status(400).json({ error: 'Missing fields.' });
            return;
        }

        const bulkResults = [];
        for (const [index, file] of files.entries()) {
            const filenameFallback = file.originalname.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
            const uniqueEmail = `bulk-${Date.now()}-${index}@uploaded.com`;

            try {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
                const savedFileName = `${uniqueSuffix}-${safeFilename}`;
                fs.writeFileSync(`uploads/${savedFileName}`, file.buffer);
                const pdfUrl = `${getBaseUrl()}/uploads/${savedFileName}`;

                let optimizedResumeText = "";
                try {
                    const parser = new PDFParse({ data: file.buffer });
                    const pdfResult = await parser.getText();
                    optimizedResumeText = pdfResult.text.substring(0, 4500);
                } catch (pdfErr) {
                    optimizedResumeText = "PDF Text Unreadable.";
                }

                const extractedDetails = extractCandidateDetailsFromResume(
                    optimizedResumeText,
                    '',
                    uniqueEmail,
                    filenameFallback
                );

                const preliminaryNlp = analyzeResumeNLP(jobDescription, optimizedResumeText, {
                    candidateName: extractedDetails.name,
                    roleTitle: jobTitle || 'this role'
                });
                const authenticity = await runAuthenticityChecks(
                    optimizedResumeText,
                    preliminaryNlp.matchedSkills,
                    '',
                    []
                );
                const aiResult = analyzeResumeNLP(jobDescription, optimizedResumeText, {
                    candidateName: extractedDetails.name,
                    roleTitle: jobTitle || 'this role',
                    authenticityScore: authenticity.authenticityScore
                });
                const recommendedRoles = evaluateRoleRecommendations(
                    aiResult.candidateSkills,
                    jobTitle || 'Bulk Upload',
                    aiResult.score
                );

                const candidate = new Candidate({
                    name: extractedDetails.name,
                    email: extractedDetails.email,
                    jobTitle: jobTitle || 'Bulk Upload',
                    pdfUrl,
                    resumeText: optimizedResumeText,
                    score: aiResult.score,
                    authenticityScore: authenticity.authenticityScore,
                    redFlags: authenticity.redFlags,
                    summary: aiResult.summary,
                    matchedSkills: aiResult.matchedSkills,
                    missingSkills: aiResult.missingSkills,
                    interviewQuestions: aiResult.interviewQuestions,
                    recommendedRoles,
                    metrics: aiResult.metrics
                });

                await candidate.save();
                bulkResults.push(candidate);

                if (index < files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (fileError) {
                console.error(`Skipped ${file.originalname}`);
            }
        }

        res.json(bulkResults.sort((a, b) => b.score - a.score));
    } catch (error) {
        res.status(500).json({ error: 'Bulk analysis failed.' });
    }
});

router.delete('/candidates/:id', async (req: Request, res: Response) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Candidate permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete candidate' });
    }
});

router.get('/candidates', async (req: Request, res: Response) => {
    try { res.json(await Candidate.find().sort({ createdAt: -1 })); }
    catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.patch('/candidates/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Rejected'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updatedCandidate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update candidate status' });
    }
});

export default router;