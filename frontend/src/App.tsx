import { useState, useEffect } from 'react';
import { Upload, Briefcase, CheckCircle, CheckCircle2, AlertCircle, Loader2, User, Mail, History, FileText, Code, Users, XCircle, FilePlus, Search, Trash2, EyeOff, Layout } from 'lucide-react';
import RadarChartUi from './components/RadarChartUi';
import Leaderboard from './components/Leaderboard';
import KanbanBoard from './components/KanbanBoard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'pipeline'>('analyze');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  
  // Form State
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // File State
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkCount, setBulkCount] = useState<number>(2);
  const [bulkFiles, setBulkFiles] = useState<{ [key: number]: File }>({});
  
  // App State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); 
  const [bulkResults, setBulkResults] = useState<any[] | null>(null); 
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); 

  useEffect(() => {
    if (activeTab === 'history') {
      fetch('http://localhost:5000/api/candidates')
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to fetch history:", err));
    }
  }, [activeTab]);

  const handleAnalyze = async () => {
    if (!jobDescription) {
      setError('Please provide a job description.');
      return;
    }

    const filesToSubmit = isBulkMode ? Object.values(bulkFiles).filter(Boolean) : (singleFile ? [singleFile] : []);

    if (filesToSubmit.length === 0) {
      setError('Please upload at least one resume.');
      return;
    }
    
    if (!isBulkMode && (!candidateName || !candidateEmail)) {
      setError('Please provide candidate name and email for single analysis.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setBulkResults(null);

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('jobTitle', jobDescription.split('\n')[0].substring(0, 30) + '...'); 

    const endpoint = isBulkMode ? 'http://localhost:5000/api/analyze-bulk' : 'http://localhost:5000/api/analyze';

    if (isBulkMode) {
      filesToSubmit.forEach(file => formData.append('resumes', file));
    } else {
      formData.append('resume', filesToSubmit[0]);
      formData.append('candidateName', candidateName);
      formData.append('candidateEmail', candidateEmail);
      if (githubUsername) formData.append('githubUsername', githubUsername);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed.');
      }
      
      const data = await response.json();
      if (isBulkMode) {
        setBulkResults(data);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFileChange = (index: number, file: File | undefined) => {
    if (file) {
      setBulkFiles(prev => ({ ...prev, [index]: file }));
    } else {
      const newFiles = { ...bulkFiles };
      delete newFiles[index];
      setBulkFiles(newFiles);
    }
  };

  // Local Soft-Delete (Hide)
  const handleLocalDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setHistory(prev => prev.filter(candidate => candidate._id !== id));
  };

  // Permanent Hard-Delete (MongoDB)
  const handlePermanentDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this candidate from the database?");
    
    if (isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/candidates/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setHistory(prev => prev.filter(candidate => candidate._id !== id));
        } else {
          alert("Failed to delete candidate from database.");
        }
      } catch (error) {
        console.error("Error deleting candidate:", error);
      }
    }
  };

  // Filter candidates based on search
  const filteredHistory = history.filter(candidate => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(searchLower) ||
      candidate.email?.toLowerCase().includes(searchLower) ||
      candidate.jobTitle?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Navigation */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Enterprise Recruitment AI</h1>
          <p className="text-gray-500 font-medium text-lg">Automated Skill-Gap Analysis & Bulk Screening</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${activeTab === 'analyze' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <FileText size={18} /> Run Analysis
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <History size={18} /> Candidate History
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <Layout size={18} /> ATS Pipeline
            </button>
          </div>
        </div>

        {/* ANALYZE TAB */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 h-fit">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setIsBulkMode(false)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${!isBulkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <User size={16}/> Single Candidate
                </button>
                <button 
                  onClick={() => setIsBulkMode(true)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${isBulkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Users size={16}/> Bulk Processing
                </button>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <Briefcase size={16} /> Job Description
                </label>
                <textarea
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Paste requirements, tech stack, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {!isBulkMode && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"><User size={14} /> Name</label>
                      <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"><Mail size={14} /> Email</label>
                      <input type="email" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"><Code size={14} /> GitHub Username (Optional)</label>
                    <input type="text" placeholder="e.g. Tofiq36" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                      <Upload size={16} /> Candidate Resume (PDF)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg p-2"
                      onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              )}

              {isBulkMode && (
                <div className="space-y-4 animate-in fade-in duration-300 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                      <FilePlus size={16} /> How many resumes to compare?
                    </label>
                    <input 
                      type="number" 
                      min="2" 
                      max="10" 
                      value={bulkCount} 
                      onChange={(e) => setBulkCount(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                    <p className="text-xs text-gray-500 mt-1">Select between 2 and 10 resumes for concurrent batch processing.</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    {Array.from({ length: bulkCount }).map((_, i) => (
                      <div key={i} className="flex flex-col">
                        <label className="text-xs font-bold text-gray-600 mb-1">Resume #{i + 1}</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-blue-600 hover:file:bg-gray-100 cursor-pointer border border-gray-200 rounded-lg p-1.5 bg-white"
                          onChange={(e) => handleBulkFileChange(i, e.target.files?.[0])}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg font-medium border border-red-100">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 disabled:bg-blue-400 disabled:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : isBulkMode ? `Analyze ${Object.values(bulkFiles).filter(Boolean).length} Resumes Concurrently` : 'Analyze & Score Candidate'}
              </button>
            </div>

            <div className="xl:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
              {!result && !bulkResults && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border-4 border-dashed border-gray-200">
                    <CheckCircle size={40} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-lg text-gray-500">System Ready</p>
                  <p className="text-sm text-center max-w-sm">Upload files and start the AI engine to generate skill matrices and leaderboards.</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-blue-500 space-y-4">
                  <Loader2 size={48} className="animate-spin" />
                  <p className="font-bold text-lg animate-pulse">{isBulkMode ? 'Processing multiple PDFs concurrently...' : 'Evaluating GitHub & Resume Data...'}</p>
                </div>
              )}

              {bulkResults && !loading && (
                <Leaderboard candidates={bulkResults} />
              )}

              {result && !loading && !isBulkMode && (
                <div className="space-y-6 animate-in fade-in duration-500 w-full">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Overall Match</p>
                      <p className={`text-7xl font-black ${result.score > 75 ? 'text-green-500' : result.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.score}%
                      </p>
                      {result.githubStats?.publicRepos > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Code size={14}/> {result.githubStats.publicRepos} Repos</span>
                          <span className="flex items-center gap-1"><Users size={14}/> {result.githubStats.followers} Followers</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <RadarChartUi metrics={result.metrics} />
                    </div>
                  </div>

                  {result.summary && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText size={14}/> AI Professional Summary</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{result.summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <h3 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500"/> Requirements Met</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedSkills?.length > 0 ? (
                          result.matchedSkills.map((skill: string, index: number) => (
                            <span key={index} className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md font-bold border border-green-200 shadow-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">No significant matching skills found.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2"><XCircle size={18} className="text-red-500"/> Missing Critical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills?.length > 0 ? (
                          result.missingSkills.map((skill: string, index: number) => (
                            <span key={index} className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-md font-bold border border-red-200 shadow-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">No critical skills missing.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-extrabold text-gray-900 mb-4">Suggested AI Interview Strategy</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      {result.interviewQuestions?.map((q: string, index: number) => (
                        <li key={index} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm items-start">
                          <span className="font-black text-blue-600 mt-0.5">{index + 1}.</span> 
                          <span className="leading-relaxed">{q}</span>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <History /> Global Candidate Database
              </h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name, email, or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50"
                />
              </div>
            </div>
            
            {filteredHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No matching records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-200 rounded-tl-xl">Candidate</th>
                      <th className="p-4 font-bold border-b border-gray-200">Role Evaluated</th>
                      <th className="p-4 font-bold border-b border-gray-200">Score</th>
                      <th className="p-4 font-bold border-b border-gray-200">GitHub</th>
                      <th className="p-4 font-bold border-b border-gray-200">Date Processed</th>
                      <th className="p-4 font-bold border-b border-gray-200 rounded-tr-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map((candidate: any) => (
                      <tr 
                        key={candidate._id} 
                        onClick={() => setSelectedCandidate(candidate)}
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group"
                        title="Click to view full profile and resume"
                      >
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{candidate.name}</p>
                          <p className="text-gray-500 text-xs">{candidate.email}</p>
                        </td>
                        <td className="p-4 text-gray-700 font-medium">{candidate.jobTitle}</td>
                        <td className="p-4">
                          <span className={`font-bold px-2.5 py-1 rounded-md text-xs shadow-sm ${candidate.score > 75 ? 'bg-green-100 text-green-700 border border-green-200' : candidate.score > 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {candidate.score}%
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {candidate.githubUsername ? <span className="flex items-center gap-1 font-medium text-blue-600"><Code size={14}/> {candidate.githubUsername}</span> : '-'}
                        </td>
                        <td className="p-4 text-gray-500 font-medium whitespace-nowrap">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleLocalDelete(e, candidate._id)}
                            className="text-gray-400 hover:text-orange-500 p-2 rounded-full hover:bg-orange-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Hide for now (soft delete)"
                          >
                            <EyeOff size={16} />
                          </button>
                          <button
                            onClick={(e) => handlePermanentDelete(e, candidate._id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete permanently (from database)"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PIPELINE / KANBAN TAB */}
        {activeTab === 'pipeline' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <KanbanBoard />
          </div>
        )}

        {/* CANDIDATE DETAIL MODAL */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedCandidate.name}</h2>
                  <p className="text-sm text-gray-500 font-medium">{selectedCandidate.jobTitle} • {selectedCandidate.email}</p>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors border border-gray-200"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-100 bg-white space-y-6">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className={`text-4xl font-black ${selectedCandidate.score > 75 ? 'text-green-500' : selectedCandidate.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {selectedCandidate.score}%
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase">AI Summary</p>
                      <p className="text-sm text-gray-800 mt-1">{selectedCandidate.summary || 'No summary available.'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">Matched Requirements</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedCandidate.matchedSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md border border-green-100">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">Critical Missing Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedCandidate.missingSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md border border-red-100">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedCandidate.metrics && (
                    <div className="pt-4">
                       <RadarChartUi metrics={selectedCandidate.metrics} />
                    </div>
                  )}
                </div>

                <div className="w-1/2 bg-gray-100 p-4">
                  {selectedCandidate.pdfUrl ? (
                    <iframe 
                      src={selectedCandidate.pdfUrl} 
                      className="w-full h-full rounded-xl border border-gray-300 shadow-sm bg-white"
                      title="Candidate Resume PDF"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <FileText size={48} className="mb-2 opacity-50" />
                      <p className="font-medium text-lg">No PDF Available</p>
                      <p className="text-sm">This candidate was processed before PDF storage was enabled.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}