import { useState, useEffect } from 'react';
import { Upload, Briefcase, CheckCircle, AlertCircle, Loader2, User, Mail, History, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  
  // Form State
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // App State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetch('http://localhost:5000/api/candidates')
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to fetch history:", err));
    }
  }, [activeTab]);

  const handleAnalyze = async () => {
    if (!file || !jobDescription || !candidateName || !candidateEmail) {
      setError('Please fill in all candidate details and upload a resume.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('candidateName', candidateName);
    formData.append('candidateEmail', candidateEmail);
    // Optional: Extract a quick title from the description to save in the DB
    formData.append('jobTitle', jobDescription.split('\n')[0].substring(0, 30) + '...'); 

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed.');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Navigation */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Recruitment Skill Gap Analyzer</h1>
          <p className="text-gray-500">AI-powered resume screening in seconds</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'analyze' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              <FileText size={18} /> New Analysis
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              <History size={18} /> Candidate History
            </button>
          </div>
        </div>

        {/* ANALYZE TAB */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User size={16} /> Candidate Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Jane Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="jane@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase size={16} /> Job Description
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paste the requirements and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Upload size={16} /> Candidate Resume (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full p-2 border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Analyze & Save Match'}
              </button>
            </div>

            {/* Right Column: AI Results */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <CheckCircle size={48} className="opacity-20" />
                  <p>Upload files to see the AI analysis here</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-blue-500 space-y-4">
                  <Loader2 size={48} className="animate-spin" />
                  <p className="font-medium animate-pulse">Gemini is analyzing the candidate...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Match Score</p>
                    <p className={`text-5xl font-extrabold ${result.score > 75 ? 'text-green-500' : result.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {result.score}%
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Missing Critical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill: string, index: number) => (
                        <span key={index} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full font-medium border border-red-100">
                          {skill}
                        </span>
                      ))}
                      {result.missingSkills.length === 0 && (
                        <span className="text-green-600 text-sm font-medium">No critical skills missing!</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Recommended Interview Questions</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      {result.interviewQuestions.map((q: string, index: number) => (
                        <li key={index} className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <span className="font-bold text-blue-600">{index + 1}.</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Previously Analyzed Candidates</h2>
            
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No candidates analyzed yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                      <th className="p-4 border-b font-semibold">Candidate</th>
                      <th className="p-4 border-b font-semibold">Job Title</th>
                      <th className="p-4 border-b font-semibold">Score</th>
                      <th className="p-4 border-b font-semibold">Missing Skills</th>
                      <th className="p-4 border-b font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {history.map((candidate: any) => (
                      <tr key={candidate._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{candidate.name}</p>
                          <p className="text-gray-500 text-xs">{candidate.email}</p>
                        </td>
                        <td className="p-4 text-gray-700">{candidate.jobTitle}</td>
                        <td className="p-4">
                          <span className={`font-bold px-2 py-1 rounded text-xs ${candidate.score > 75 ? 'bg-green-100 text-green-700' : candidate.score > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {candidate.score}%
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {candidate.missingSkills.length > 0 
                            ? candidate.missingSkills.slice(0, 2).join(', ') + (candidate.missingSkills.length > 2 ? '...' : '') 
                            : 'None'}
                        </td>
                        <td className="p-4 text-gray-500">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}