import { Trophy, XCircle, CheckCircle2, Download, Info } from 'lucide-react';

export default function Leaderboard({ candidates }: { candidates: any[] }) {
  if (!candidates || candidates.length === 0) return null;

  const exportToCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Match Score (%)', 'Summary', 'Matched Skills', 'Missing Skills'];
    const rows = candidates.map((c, i) => [
      i + 1,
      `"${c.name}"`,
      `"${c.email}"`,
      c.score,
      `"${c.summary || ''}"`,
      `"${c.matchedSkills?.join(', ') || ''}"`,
      `"${c.missingSkills?.join(', ') || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'candidate_leaderboard.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Bulk Analysis Leaderboard</h2>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>
      
      <div className="space-y-6">
        {candidates.map((candidate, index) => {
          // Dynamic Color Grading based on Score
          const isExcellent = candidate.score >= 75;
          const isAverage = candidate.score >= 50 && candidate.score < 75;
          
          const cardStyle = isExcellent 
            ? 'border-green-300 bg-green-50 shadow-green-100' 
            : isAverage 
              ? 'border-yellow-300 bg-yellow-50 shadow-yellow-100' 
              : 'border-red-300 bg-red-50 shadow-red-100';

          const rankBadgeStyle = isExcellent ? 'bg-green-500 text-white' : isAverage ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white';
          const scoreTextStyle = isExcellent ? 'text-green-700' : isAverage ? 'text-yellow-700' : 'text-red-700';

          return (
            <div key={index} className={`p-5 rounded-2xl border-2 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md ${cardStyle}`}>
              
              {/* Header: Rank, Name, Score, Summary */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/50 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 shrink-0 rounded-full font-black text-xl shadow-sm ${rankBadgeStyle}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1">{candidate.name}</h3>
                    {candidate.summary && (
                      <p className="text-sm text-gray-700 mt-1 max-w-2xl leading-relaxed flex items-start gap-1">
                        <Info size={14} className="shrink-0 mt-0.5 opacity-70" /> {candidate.summary}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 bg-white/60 px-4 py-2 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Match</p>
                  <p className={`text-3xl font-black ${scoreTextStyle}`}>{candidate.score}%</p>
                </div>
              </div>
              
              {/* Skills Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="bg-white/60 p-3 rounded-xl border border-white/50">
                  <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={14} /> Requirements Met
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchedSkills?.length > 0 ? (
                      candidate.matchedSkills.map((skill: string, i: number) => (
                        <span key={i} className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md border border-green-200 font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No significant matching skills found.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-white/60 p-3 rounded-xl border border-white/50">
                  <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <XCircle size={14} /> Critical Gaps
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missingSkills?.length > 0 ? (
                      candidate.missingSkills.map((skill: string, i: number) => (
                        <span key={i} className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md border border-red-200 font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No critical skills missing.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}